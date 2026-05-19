package com.axonactive.leave_management.leave_request.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRequestDTO {

    @NotBlank(message = "Rejection note must not be blank")
    private String note;
}
