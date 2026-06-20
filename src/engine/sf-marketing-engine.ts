import { requireCredential } from '@mcpfusion/core';

let cachedToken: { token: string; instanceUrl: string; exp: number } | null = null;

async function getToken(): Promise<{ token: string; instanceUrl: string }> {
    if (cachedToken && Date.now() < cachedToken.exp) return { token: cachedToken.token, instanceUrl: cachedToken.instanceUrl };
    const instanceUrl = requireCredential('SF_INSTANCE_URL').replace(/\/+$/, '');
    const res = await fetch(`${instanceUrl}/services/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=client_credentials&client_id=${encodeURIComponent(requireCredential('SF_CONSUMER_KEY'))}&client_secret=${encodeURIComponent(requireCredential('SF_CONSUMER_SECRET'))}` });
    if (!res.ok) throw new Error(`Salesforce Auth [${res.status}]: ${await res.text()}`);
    const d = await res.json() as any;
    cachedToken = { token: d.access_token, instanceUrl: d.instance_url || instanceUrl, exp: Date.now() + 3500000 };
    return { token: cachedToken.token, instanceUrl: cachedToken.instanceUrl };
}

async function sfRequest(path: string, options: RequestInit = {}): Promise<any> {
    const { token, instanceUrl } = await getToken();
    const res = await fetch(`${instanceUrl}${path}`, { ...options, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
    if (!res.ok) throw new Error(`Salesforce [${res.status}]: ${await res.text().catch(() => '')}`);
    if (res.status === 204) return { success: true };
    return res.json();
}

async function sfQuery(soql: string): Promise<any[]> {
    return (await sfRequest(`/services/data/v62.0/query?q=${encodeURIComponent(soql)}`)).records || [];
}

function fmt(records: any[], type: string) {
    if (!records.length) return [{ id: '', name: `No ${type} found`, detail: '', status: '', members: '', converted: '', date: '', extra: '' }];
    return records.map((r: any) => ({
        id: r.Id || '', name: r.Name || '', detail: r.Description || r.Type || '',
        status: r.Status || r.IsActive?.toString() || '', members: r.NumberOfLeads?.toString() || r.NumberOfContacts?.toString() || '',
        converted: r.NumberOfConvertedLeads?.toString() || r.NumberOfResponses?.toString() || '',
        date: r.StartDate || r.EndDate || r.CreatedDate || '',
        extra: r.ExpectedRevenue?.toString() || r.BudgetedCost?.toString() || r.ActualCost?.toString() || ''
    }));
}

export async function searchCampaigns(query: string, limit: number = 20) {
    return fmt(await sfQuery(`SELECT Id,Name,Type,Status,StartDate,EndDate,NumberOfLeads,NumberOfContacts,NumberOfConvertedLeads,NumberOfResponses,ExpectedRevenue,BudgetedCost,ActualCost,Description FROM Campaign WHERE Name LIKE '%${query}%' ORDER BY StartDate DESC LIMIT ${limit}`), 'campaigns');
}

export async function getCampaignsByStatus(status: string, limit: number = 20) {
    return fmt(await sfQuery(`SELECT Id,Name,Type,Status,StartDate,EndDate,NumberOfLeads,NumberOfContacts,NumberOfConvertedLeads,ExpectedRevenue FROM Campaign WHERE Status = '${status}' ORDER BY StartDate DESC LIMIT ${limit}`), 'campaigns');
}

export async function createCampaign(data: { name: string; type?: string; status?: string; startDate?: string; endDate?: string; description?: string; budgetedCost?: number }) {
    const result = await sfRequest('/services/data/v62.0/sobjects/Campaign', { method: 'POST', body: JSON.stringify({ Name: data.name, Type: data.type, Status: data.status || 'Planned', StartDate: data.startDate, EndDate: data.endDate, Description: data.description, BudgetedCost: data.budgetedCost }) });
    return [{ id: result.id || '', name: data.name, detail: data.type || '', status: data.status || 'Planned', members: '0', converted: '0', date: data.startDate || '', extra: data.budgetedCost?.toString() || '' }];
}

export async function getCampaignMembers(campaignId: string, limit: number = 50) {
    const records = await sfQuery(`SELECT Id,Contact.Name,Lead.Name,Status,FirstRespondedDate,CampaignId FROM CampaignMember WHERE CampaignId = '${campaignId}' LIMIT ${limit}`);
    if (!records.length) return [{ id: '', name: 'No members', detail: '', status: '', members: '', converted: '', date: '', extra: '' }];
    return records.map((r: any) => ({
        id: r.Id || '', name: r.Contact?.Name || r.Lead?.Name || '', detail: '',
        status: r.Status || '', members: '', converted: '',
        date: r.FirstRespondedDate || '', extra: r.CampaignId || ''
    }));
}

export async function addCampaignMember(campaignId: string, contactId?: string, leadId?: string, status?: string) {
    const body: any = { CampaignId: campaignId, Status: status || 'Sent' };
    if (contactId) body.ContactId = contactId;
    if (leadId) body.LeadId = leadId;
    const result = await sfRequest('/services/data/v62.0/sobjects/CampaignMember', { method: 'POST', body: JSON.stringify(body) });
    return [{ id: result.id || '', name: 'Member added', detail: contactId || leadId || '', status: status || 'Sent', members: '', converted: '', date: new Date().toISOString(), extra: '' }];
}

export async function getCampaignPerformance() {
    const records = await sfQuery(`SELECT Type, COUNT(Id) cnt, SUM(NumberOfLeads) leads, SUM(NumberOfConvertedLeads) converted, SUM(ActualCost) cost FROM Campaign WHERE IsActive = true GROUP BY Type ORDER BY SUM(NumberOfConvertedLeads) DESC`);
    return records.map((r: any) => ({
        id: '', name: r.Type || 'Unknown', detail: `${r.cnt} campaigns`,
        status: 'active', members: r.leads?.toString() || '0',
        converted: r.converted?.toString() || '0', date: '',
        extra: r.cost ? `Cost: $${r.cost}` : ''
    }));
}
