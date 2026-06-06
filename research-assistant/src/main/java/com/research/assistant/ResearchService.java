package com.research.assistant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
//import com.fasterxml.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResearchService {

    @Value("${gemini.api.url}")
    private String geminiAPIUrl;

    @Value("${gemini.api.key}")
    private String geminiAPIkey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ResearchService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper){
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // MAIN ENTRY POINT - Handles all operations
    public Mono<String> processContent(ResearchRequest request) {
        // Route to different handlers based on operation type
        // WHY? Different operations need different prompt strategies

        switch(request.getOperation()) {
            case "summarize":
                return handleSummarization(request);

            case "followup":
                return handleFollowUpQuestion(request);

            case "search":
                return handleWebSearch(request);

            default:
                return Mono.just("Error: Unknown operation - " + request.getOperation());
        }
    }


    // FEATURE 1: SMART SUMMARIZATION WITH WORD LIMIT
    private Mono<String> handleSummarization(ResearchRequest request) {
        // Build a smart prompt that respects word count
        String prompt = buildSummarizationPrompt(request);

        // Send to Gemini API
        return callGeminiAPI(prompt);
    }

    // WHY THIS METHOD?
    // User might say "Summarize in 75 words" or "Give brief summary"
    // We need to intelligently extract the word count and build the prompt
    private String buildSummarizationPrompt(ResearchRequest request) {
        StringBuilder prompt = new StringBuilder();

        // Start with base instruction
        prompt.append("You are a professional summarization expert. ");

        // IF user specified word count, include it
        if (request.getWordLimit() != null && request.getWordLimit() > 0) {
            prompt.append("Provide a summary in EXACTLY ")
                    .append(request.getWordLimit())
                    .append(" words (not more, not less). ");
            // WHY EXACTLY? To train AI to be precise, not approximate
        } else {
            // Default: provide concise summary
            prompt.append("Provide a clear and concise summary in 30-50 words. ");
        }

        prompt.append("Make it professional and informative.\n\n");
        prompt.append("TEXT TO SUMMARIZE:\n");
        prompt.append(request.getContent());

        return prompt.toString();
    }

    // FEATURE 2: FOLLOW-UP QUESTIONS WITH CONTEXT
    private Mono<String> handleFollowUpQuestion(ResearchRequest request) {
        // Build prompt that includes conversation history
        String prompt = buildFollowUpPrompt(request);

        // Send to Gemini API
        return callGeminiAPI(prompt);
    }

    // WHY THIS METHOD?
    // For follow-ups, AI needs to remember:
    // 1. The original text (for context)
    // 2. The summary (for reference)
    // 3. Previous Q&A (for conversation flow)
    // 4. The current question (to answer)

    private String buildFollowUpPrompt(ResearchRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an intelligent research assistant helping analyze content.\n\n");

        // Context section
        prompt.append("=== ORIGINAL CONTENT (for context) ===\n");
        if (request.getOriginalSelectedText() != null) {
            prompt.append(request.getOriginalSelectedText());
        }
        prompt.append("\n\n");

        // Summary section
        prompt.append("=== SUMMARY (what we discussed) ===\n");
        prompt.append(request.getContent());
        prompt.append("\n\n");

        // Conversation history
        if (request.getConversationHistory() != null && !request.getConversationHistory().isEmpty()) {
            prompt.append("=== PREVIOUS CONVERSATION ===\n");
            for (ResearchRequest.ConversationMessage msg : request.getConversationHistory()) {
                if ("user".equals(msg.getRole())) {
                    prompt.append("User asked: ").append(msg.getContent()).append("\n");
                } else {
                    prompt.append("You answered: ").append(msg.getContent()).append("\n");
                }
            }
            prompt.append("\n");
        }

        // NEW SECTION: Detect and handle format requests
        String question = request.getQuestion().toLowerCase();

        if (question.contains("bullet") || question.contains("point")) {
            int bulletCount = 5;

            java.util.regex.Pattern pattern =
                    java.util.regex.Pattern.compile("(\\d+)\\s*(?:bullet|point)");
            java.util.regex.Matcher matcher = pattern.matcher(question);

            if (matcher.find()) {
                bulletCount = Integer.parseInt(matcher.group(1));
            }

            prompt.append("=== FORMAT INSTRUCTION ===\n");
            prompt.append("Return EXACTLY ").append(bulletCount).append(" bullet points.\n\n");

            prompt.append("OUTPUT FORMAT:\n\n");
            prompt.append("• First bullet point\n\n");
            prompt.append("• Second bullet point\n\n");
            prompt.append("• Third bullet point\n\n");

            prompt.append("MANDATORY RULES:\n");
            prompt.append("1. Each bullet MUST start with the bullet character '•'\n");
            prompt.append("2. After EVERY bullet, output TWO newline characters (\\n\\n)\n");
            prompt.append("3. Never place two bullet points on the same line\n");
            prompt.append("4. Do not use paragraphs\n");
            prompt.append("5. Output ONLY the bullet points and nothing else\n");
            prompt.append("6. Preserve blank lines between bullets\n\n");
        }
        else if (question.contains("table") || question.contains("comparison")) {
            prompt.append("=== FORMAT INSTRUCTION ===\n");
            prompt.append("IMPORTANT: Format your answer as a table with clear columns and rows.\n\n");
        }
        else if (question.contains("step") || question.contains("process")) {
            prompt.append("=== FORMAT INSTRUCTION ===\n");
            prompt.append("IMPORTANT: Format your answer as numbered steps.\n");
            prompt.append("Use this format:\n");
            prompt.append("1. First step\n");
            prompt.append("2. Second step\n");
            prompt.append("3. Third step\n\n");
        }

        // Current question
        prompt.append("=== USER QUESTION ===\n");
        prompt.append(request.getQuestion()).append("\n\n");
        prompt.append("Please answer based on the context above. Be specific and reference the content when relevant.");

        return prompt.toString();
    }

    // FEATURE 3: WEB SEARCH ENHANCEMENT
    private Mono<String> handleWebSearch(ResearchRequest request) {
        // TODO: Integrate with actual web search API (Google Search, Bing, etc.)
        // For now, we'll just enhance the prompt to mention web context

        String prompt = new StringBuilder()
                .append("You are a research assistant with access to knowledge up to your training date.\n")
                .append("The user asked about: ").append(request.getWebSearchQuery()).append("\n")
                .append("Original context: ").append(request.getOriginalSelectedText()).append("\n\n")
                .append("Provide an enhanced answer that includes current information beyond training data if applicable.")
                .toString();

        return callGeminiAPI(prompt);
    }

    // CORE API CALLING METHOD - Send request to Gemini
    private Mono<String> callGeminiAPI(String prompt) {
        // Build the request body for Gemini API
        // WHY this format? This is what Google's Gemini API expects
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                }
        );

        // Make the API call
        // WHY Mono<String>? It's non-blocking, so extension doesn't freeze
        return webClient.post()
                .uri(geminiAPIUrl + geminiAPIkey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractTextFromResponse);
    }

    // RESPONSE PARSING - Extract answer from Gemini's response
    private String extractTextFromResponse(String response) {
        try {
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);

            if (geminiResponse.getCandidates() != null &&
                    !geminiResponse.getCandidates().isEmpty()) {

                String text = geminiResponse.getCandidates()
                        .get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText();

                return formatBullets(text);
            }

            return "No content found in response";

        } catch (Exception e) {
            return "Error Parsing: " + e.getMessage();
        }
    }

    private String formatBullets(String text) {

        if (!text.contains("•")) {
            return text;
        }

        // Insert blank line before every bullet except first
        text = text.replaceAll("\\s*•\\s*", "\n\n• ");

        return text.trim();
    }
}
