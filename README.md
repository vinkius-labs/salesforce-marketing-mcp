# 🎯 Salesforce Marketing Cloud MCP Integration

[![Host on Vinkius Cloud](https://img.shields.io/badge/Deploy%20on-Vinkius%20Cloud-blue?style=for-the-badge)](https://vinkius.com/mcp/salesforce-marketing-cloud)

A cutting-edge Model Context Protocol server that translates LLM intent into Salesforce Marketing Cloud (SFMC) orchestration. Let your autonomous agents segment audiences, manage subscribers, and trigger Journey Builder workflows entirely through natural language.

## Revolutionizing Campaign Orchestration

Interacting with the SFMC SOAP and REST APIs is notoriously difficult due to complex XML envelopes, strict rate limits, and asynchronous data extension handling. This MCP server acts as an intelligent proxy. It provides LLMs with deterministic, safe tools to interact with your marketing stack.

### Why Vinkius is the Optimal Deployment Strategy

To ensure your marketing automation remains uninterrupted, this MCP is built to run on the **Vinkius Edge Platform**.
- **Zero-Maintenance Infrastructure**: The Vinkius platform handles horizontal scaling automatically. Whether your agent is pulling 10 or 10,000 subscriber records, Vinkius scales the MCP instance instantly.
- **Enterprise-Grade Compliance**: Securely bind your Marketing Cloud client IDs and secrets to the Vinkius vault. The LLM never touches your keys.
- **Vinkius Ecosystem**: Tap into the broader Vinkius marketplace to combine this SFMC server with other data enrichment MCPs seamlessly.

## Agent Capabilities

This server equips your AI with powerful marketing primitives:
- **`query_data_extension`**: A safe query interface for Data Extensions. Perfect for agents that need to analyze audience segments or retrieve personalized customer attributes before drafting an email.
- **`trigger_journey`**: Push users directly into active Salesforce Journeys. Enables the AI to respond to an event and immediately enroll a user in a nurture campaign.
- **`manage_subscriber`**: View, update, or unsubscribe contacts with built-in safeguards to respect communication preferences.

## 🌐 Deploy to Vinkius Edge

Get your Marketing Cloud MCP running globally in under a minute. We utilize Vinkius Cloud for its unparalleled edge performance and security.

Execute the following command in your terminal:
```bash
npx mcpfusion deploy
```

You are ready to connect your LLM to the endpoint provided by Vinkius.

🔗 **[Get Started with the Salesforce Marketing Cloud MCP on Vinkius](https://vinkius.com/mcp/salesforce-marketing-cloud)**

## Local Contributions
Built on top of the `@mcpfusion/core` framework.
```bash
npm install
npm run dev
```
