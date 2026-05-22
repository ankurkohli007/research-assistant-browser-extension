package com.research.assistant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import tools.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class ResearchService {

    //inject from the application.properties such as URL
    @Value("${gemini.api.url}")
    private String geminiAPIUrl;

    //inject from the application.properties such as KEY
     @Value("${gemini.api.key}")
    private String geminiAPIkey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ResearchService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper){
        // helps to get instance of webClient
        this.webClient = webClientBuilder.build();
        // objectMapper for geminiResponse
        this.objectMapper = objectMapper;
    }


//    public String processContent(ResearchRequest request) {
public Mono<String> processContent(ResearchRequest request) {
        // build the prompt
        String prompt = buildPrompt(request);

        // query the AI model API
        //below the preparation of API
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                }
        );

        // actual API call
        // response from API using web client
        // Executes a synchronous POST request to the Gemini API
        // using WebClient and converts the response body into a String
//        String response = webClient.post()
//                .uri(geminiAPIUrl + geminiAPIkey)
//                .bodyValue(requestBody)
//                .retrieve()
//                .bodyToMono(String.class);
//                .block();

    return webClient.post()
            .uri(geminiAPIUrl + geminiAPIkey)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .map(this::extractTextFromResponse);


        // parse the response
        // return the response


//        return extractTextFromResponse(response);
    }

    private String extractTextFromResponse(String response) {
        try {
            // using objectMapper to convert JSON response into object type
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if (geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()) {
                GeminiResponse.Candidate firstCandidate = geminiResponse.getCandidates().get(0);
                if (firstCandidate.getContent() != null &&
                        firstCandidate.getContent().getParts() != null &&
                        !firstCandidate.getContent().getParts().isEmpty()) {
                    return firstCandidate.getContent().getParts().get(0).getText();
                }
            }
            return "No content found in response";
        } catch (Exception e) {
            return "Error Parsing: " + e.getMessage();
        }
    }

    // prompt crafting
    private String buildPrompt(ResearchRequest request){
        StringBuilder prompt = new StringBuilder();
        switch(request.getOperation()) {
            case "summarize":
                prompt.append("Provide a clear and concise summary of the following text in a few sentences:\n\n");
                break;
            case "suggest":
                prompt.append("Based on the following content suggest elated topics and further reading. Format the response with clear headings and bullet points:\n\n");
                break;
            default:
                throw new IllegalArgumentException("Unknown Operation:" + request.getOperation());
        }
        //append the text
        prompt.append(request.getContent());
        return prompt.toString();
    }
}
