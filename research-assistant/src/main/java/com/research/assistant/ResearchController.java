package com.research.assistant;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class ResearchController {

    private final ResearchService researchService;

    // ═══════════════════════════════════════════════════════════════════
    // SINGLE ENDPOINT - Handles all operations
    // WHY? Cleaner architecture, easier to maintain
    // ═══════════════════════════════════════════════════════════════════
    @PostMapping("/process")
    public Mono<String> processContent(@RequestBody ResearchRequest request) {

        // STEP 1: Extract word count from user's input
        // WHY? User might say "Summarize in 75 words"
        // We need to parse "75" from the sentence
        extractWordLimitFromContent(request);

        // STEP 2: Sanitize operation
        // WHY? Make sure operation is valid before sending to service
        String operation = request.getOperation() == null ? "summarize" : request.getOperation().toLowerCase();
        request.setOperation(operation);

        // STEP 3: Call service to process
        return researchService.processContent(request);
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPER: Extract word count from natural language
    // ═══════════════════════════════════════════════════════════════════
    private void extractWordLimitFromContent(ResearchRequest request) {

        // WHY this regex?
        // It finds patterns like:
        // - "50 words"
        // - "in 100 words"
        // - "exactly 75 words"
        // - "200-word summary"

        String content = request.getContent();
        if (content == null) return;

        // Pattern explanation:
        // (\d+) = Find one or more digits (like 50, 100, 75)
        // Pattern below matches: "50 words" or "in 75 words" or "exactly 100 words"
        Pattern pattern = Pattern.compile("(?:in|exactly|around|about)?\\s*(\\d+)\\s*(?:word|words)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);

        // If pattern found (e.g., "Summarize in 100 words")
        if (matcher.find()) {
            try {
                int wordLimit = Integer.parseInt(matcher.group(1));
                request.setWordLimit(wordLimit);

                // Remove the word count phrase from content
                // WHY? So AI doesn't get confused by seeing "100 words" in the text itself
                String cleanedContent = content.replaceAll("(?i)(?:in|exactly|around|about)?\\s*\\d+\\s*(?:word|words)", "").trim();
                request.setContent(cleanedContent);

            } catch (NumberFormatException e) {
                // If parsing fails, just continue without word limit
                // No need to crash the app
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // FUTURE ENDPOINT: Handle multi-turn conversation in one request
    // (Optional - for advanced use cases)
    // ═══════════════════════════════════════════════════════════════════
    @PostMapping("/chat")
    public Mono<String> chat(@RequestBody ResearchRequest request) {
        // This endpoint specifically handles follow-up questions
        // Can be used later for more advanced conversational features

        // Ensure operation is set to followup
        request.setOperation("followup");

        return researchService.processContent(request);
    }
}