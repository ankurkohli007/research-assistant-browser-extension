package com.research.assistant;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/research") // defining all the end points with this particular controller for the particular URL
@CrossOrigin(origins = "*") // allow accessing all the end point in this controller from any frontend
@AllArgsConstructor // make all argument as a constructor that field has been defined
public class ResearchController {
    private final ResearchService researchService;


//    @PostMapping("/process") // link to POST request
//    public ResponseEntity<String> processContent(@RequestBody ResearchRequest request){
//        String result = researchService.processContent(request);
//        return ResponseEntity.ok(result);
//    }
    @PostMapping("/process")
    public Mono<String> processContent(@RequestBody ResearchRequest request) {
        return researchService.processContent(request);
    }
}