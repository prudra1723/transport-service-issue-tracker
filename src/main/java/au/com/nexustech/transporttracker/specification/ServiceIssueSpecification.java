package au.com.nexustech.transporttracker.specification;

import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ServiceIssueSpecification {

    private ServiceIssueSpecification() {
    }

    public static Specification<ServiceIssue> withFilters(
            String keyword,
            IssueStatus status,
            IssuePriority priority,
            IssueCategory category,
            Long assignedToId
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (keyword != null && !keyword.isBlank()) {
                String searchText = keyword.trim()
                        .toLowerCase(Locale.ROOT);

                var titlePosition = criteriaBuilder.locate(
                        criteriaBuilder.lower(
                                root.<String>get("title")
                        ),
                        searchText
                );

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.greaterThan(
                                titlePosition,
                                0
                        )
                );
            }

            if (status != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                root.get("status"),
                                status
                        )
                );
            }

            if (priority != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        )
                );
            }

            if (category != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                root.get("category"),
                                category
                        )
                );
            }

            if (assignedToId != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                root.get("assignedTo").get("id"),
                                assignedToId
                        )
                );
            }

            return predicate;
        };
    }
}