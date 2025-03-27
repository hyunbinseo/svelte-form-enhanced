export const actions = {
	default: async () => {
		await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random()) * 5000));
		return { success: Math.random() >= 0.5 };
	},
};
