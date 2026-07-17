#!/usr/bin/env node

/**
 * StudyMate MCP Server
 * A Node MCP server over stdio that exposes two tools:
 *   - list_notes: Returns all notes from the Express API
 *   - create_note: Adds a new note via the Express API
 *
 * Communicates with the Express backend at http://localhost:5000
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "http://localhost:5000";

// Create the MCP server
const server = new McpServer({
    name: "studymate-mcp-server",
    version: "1.0.0",
});

// ─── Tool: list_notes ────────────────────────────────────────────────
// Returns all notes from the StudyMate Express API
server.tool(
    "list_notes",
    "Returns all study notes from the StudyMate app. Each note has a title, subject, content, and optional AI summary.",
    {},
    async () => {
        try {
            const response = await fetch(`${API_BASE}/api/notes`);
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            const notes = await response.json();

            if (notes.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No notes found. You can create one using the create_note tool.",
                        },
                    ],
                };
            }

            const formatted = notes
                .map(
                    (note, i) =>
                        `${i + 1}. **${note.title}** (${note.subject})\n   ${note.content}${note.summary ? "\n   📝 Summary: " + note.summary : ""}`
                )
                .join("\n\n");

            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${notes.length} note(s):\n\n${formatted}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching notes: ${error.message}. Make sure the Express server is running on ${API_BASE}.`,
                    },
                ],
                isError: true,
            };
        }
    }
);

// ─── Tool: create_note ───────────────────────────────────────────────
// Adds a new note via the StudyMate Express API
server.tool(
    "create_note",
    "Creates a new study note in the StudyMate app. Requires a title and content, subject is optional.",
    {
        title: z.string().describe("The title of the study note"),
        subject: z
            .string()
            .optional()
            .describe(
                "The subject/category of the note (e.g. React, MongoDB, JavaScript). Defaults to 'General'."
            ),
        content: z.string().describe("The main content/body of the study note"),
    },
    async ({ title, subject, content }) => {
        try {
            const response = await fetch(`${API_BASE}/api/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    subject: subject || "General",
                    content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `API responded with status ${response.status}`
                );
            }

            const savedNote = await response.json();

            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Note created successfully!\n\n**Title:** ${savedNote.title}\n**Subject:** ${savedNote.subject}\n**Content:** ${savedNote.content}\n**ID:** ${savedNote._id}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating note: ${error.message}. Make sure the Express server is running on ${API_BASE}.`,
                    },
                ],
                isError: true,
            };
        }
    }
);

// ─── Start the server with stdio transport ───────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Log to stderr only (stdout is reserved for MCP JSON-RPC)
    console.error("StudyMate MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
});
