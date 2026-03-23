package com.exchkr.club.management.model.api.request;

import java.util.List;

public class BudgetSetupRequest {
	private Long totalBudget;
	private List<CategoryAllocationDTO> categories;

	public Long getTotalBudget() {
		return totalBudget;
	}

	public void setTotalBudget(Long totalBudget) {
		this.totalBudget = totalBudget;
	}

	public List<CategoryAllocationDTO> getCategories() {
		return categories;
	}

	public void setCategories(List<CategoryAllocationDTO> categories) {
		this.categories = categories;
	}

	public static class CategoryAllocationDTO {
		private String categoryName;
		private Long totalBudgeted;
		private Long totalSpent;

		public String getCategoryName() {
			return categoryName;
		}

		public void setCategoryName(String categoryName) {
			this.categoryName = categoryName;
		}

		public Long getTotalBudgeted() {
			return totalBudgeted;
		}

		public void setTotalBudgeted(Long totalBudgeted) {
			this.totalBudgeted = totalBudgeted;
		}

		public Long getTotalSpent() {
			return totalSpent;
		}

		public void setTotalSpent(Long totalSpent) {
			this.totalSpent = totalSpent;
		}

	}
}