package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.enums.CommentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddCommentRequest(

        @NotBlank(message = "Comment text is required")
        @Size(
                max = 5000,
                message = "Comment must not exceed 5000 characters"
        )
        String commentText,

        @NotNull(message = "Comment type is required")
        CommentType commentType,

        @NotNull(message = "Author ID is required")
        Long authorId
) {
}