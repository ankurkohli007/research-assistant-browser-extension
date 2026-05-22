package com.research.assistant;

import lombok.Data;

@Data // getters-setters
public class ResearchRequest {
    private String content;
    private String operation;
}
