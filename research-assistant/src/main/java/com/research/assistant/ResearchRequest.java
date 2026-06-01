package com.research.assistant;

import lombok.Data;
import java.util.List;

@Data // Auto generates getters and setters
public class ResearchRequest {

    // Original fields (keep these!)
    private String content;           // The text to summarize
    private String operation;         // "summarize", "followup", "search", etc.

    // NEW FIELD: What type of content is being summarized?
    private String contentType; // "selected" or "fullpage"

    // NEW FIELD: Full webpage URL
    private String pageUrl;

    // NEW FIELDS FOR WORD COUNT FEATURE
    private Integer wordLimit;        // e.g., 50, 100, 200 words max
    // WHY? When user says "summarize in 50 words", we extract the number and store it here

    // NEW FIELDS FOR FOLLOW-UP QUESTIONS
    private String question;          // The follow-up question user asks
    // WHY? For questions like "What are solutions?", we store the question here

    // NEW FIELDS FOR CONVERSATION HISTORY
    private List<ConversationMessage> conversationHistory;  // All previous Q&A
    // WHY? AI needs to remember what was asked before to give context-aware answers

    // NEW FIELDS FOR WEB SEARCH CONTEXT
    private Boolean includeWebSearch;  // Should AI look online too?
    private String webSearchQuery;     // What to search for online
    // WHY? Let AI access current information from the web

    // NEW FIELD TO TRACK ORIGINAL CONTENT
    private String originalSelectedText;  // The original text user selected
    // WHY? AI needs this to maintain context across the conversation


    // INNER CLASS: Represents one message in the conversation
    @Data
    public static class ConversationMessage {
        private String role;        // "user" or "assistant"
        private String content;     // The actual message text
        private Long timestamp;     // When it was sent (for ordering)

        // Constructor for easy creation
        public ConversationMessage(String role, String content) {
            this.role = role;
            this.content = content;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
