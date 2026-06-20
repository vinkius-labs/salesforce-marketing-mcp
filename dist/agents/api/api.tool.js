import { f } from '../../mcpfusion.js';
import { SFPresenter } from '../../views/index.js';
import { searchCampaigns, getCampaignsByStatus, createCampaign, getCampaignMembers, addCampaignMember, getCampaignPerformance } from '../../engine/sf-marketing-engine.js';
export const searchCampaignsTool = f.query('sf_search_campaigns')
    .describe('Search Salesforce marketing campaigns by name to find initiatives with status, type, budget, and lead/contact conversion metrics.')
    .instructions('Queries the Campaign sObject. Returns campaign name, status (Planned/In Progress/Completed/Aborted), type (Email/Conference/Webinar/Advertisement), start/end dates, number of leads generated, contacts converted, budgeted cost, and actual cost. Use when the user asks about marketing initiatives, campaign performance, or budget spend.')
    .withString('query', 'Campaign name keyword').withOptionalNumber('limit', 'Maximum results (default: 20)')
    .egress(1024 * 1024).returns(SFPresenter)
    .handle(async (i) => await searchCampaigns(i.query, i.limit));
export const getCampaignsByStatusTool = f.query('sf_campaigns_by_status')
    .describe('Get Salesforce campaigns filtered by status — Planned, In Progress, Completed, or Aborted — with full metrics.')
    .instructions('Filters Campaign records by Status. Returns campaigns with lead/contact counts, budget, and conversion data. Use for questions like "which campaigns are currently running?" or "show completed campaigns with their results."')
    .withString('status', 'Campaign status: Planned, In Progress, Completed, Aborted').withOptionalNumber('limit', 'Maximum results (default: 20)')
    .egress(1024 * 1024).returns(SFPresenter)
    .handle(async (i) => await getCampaignsByStatus(i.status, i.limit));
export const createCampaignTool = f.action('sf_create_campaign')
    .describe('Create a new marketing campaign in Salesforce with name, type, status, dates, description, and budget.')
    .instructions('Creates a Campaign sObject. Name is required. Type: Email, Conference, Webinar, Trade Show, Public Relations, Advertisement, Banner Ads, Telemarketing. Status defaults to "Planned". Dates use YYYY-MM-DD. budgetedCost is the planned spend. Returns the created campaign with its Salesforce ID.')
    .withString('name', 'Campaign name').withOptionalString('type', 'Type: Email, Conference, Webinar, Advertisement, etc.')
    .withOptionalString('status', 'Status (default: Planned)').withOptionalString('startDate', 'Start date YYYY-MM-DD')
    .withOptionalString('endDate', 'End date YYYY-MM-DD').withOptionalString('description', 'Campaign description')
    .withOptionalNumber('budgetedCost', 'Planned budget amount')
    .returns(SFPresenter)
    .handle(async (i) => await createCampaign(i));
export const getCampaignMembersTool = f.query('sf_campaign_members')
    .describe('Get all leads and contacts enrolled in a specific Salesforce campaign with their membership status and response dates.')
    .instructions('Retrieves CampaignMember junction records for a campaign. Returns member name, type (Lead or Contact), status (Sent/Responded/etc.), and response date. Use to see who is in a campaign, track engagement, or analyze campaign reach. Essential for campaign ROI and attribution analysis.')
    .withString('campaignId', 'Campaign ID (18-char Salesforce ID)').withOptionalNumber('limit', 'Maximum results (default: 20)')
    .egress(1024 * 1024).returns(SFPresenter)
    .handle(async (i) => await getCampaignMembers(i.campaignId, i.limit));
export const addCampaignMemberTool = f.action('sf_add_campaign_member')
    .describe('Add a lead or contact to a Salesforce marketing campaign for attribution tracking and engagement measurement.')
    .instructions('Creates a CampaignMember junction record linking a Lead or Contact to a Campaign. Provide campaignId and either contactId OR leadId (not both). Status defaults to "Sent" but can be set to "Responded", "Registered", etc. based on your campaign member statuses. Returns the created membership record.')
    .withString('campaignId', 'Campaign ID').withOptionalString('contactId', 'Contact ID (provide either this OR leadId)')
    .withOptionalString('leadId', 'Lead ID (provide either this OR contactId)')
    .withOptionalString('status', 'Member status (default: Sent)')
    .returns(SFPresenter)
    .handle(async (i) => await addCampaignMember(i.campaignId, i.contactId, i.leadId, i.status));
export const getCampaignPerformanceTool = f.query('sf_campaign_performance')
    .describe('Get aggregate marketing campaign performance — campaign counts, total leads, conversions, and costs grouped by campaign type.')
    .instructions('Runs aggregate SOQL on Campaign records grouped by Type. Returns the number of campaigns, total leads generated, total conversions, total budgeted cost, and actual cost per campaign type. Provides an instant ROI overview across all marketing channels. Use for marketing dashboard, channel-level performance comparison, or budget allocation analysis.')
    .egress(1024 * 1024).returns(SFPresenter)
    .handle(async () => await getCampaignPerformance());
