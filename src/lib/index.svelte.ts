import type { SubmitFunction } from '@sveltejs/kit';

type FormState = 'standby' | 'submitting' | 'submitted';

type SubmitFunctionParam = Parameters<SubmitFunction>[0];

type ReturnFunctionParam<GeneratedSubmitFunction extends SubmitFunction> = //
	Parameters<Exclude<Awaited<ReturnType<GeneratedSubmitFunction>>, void>>[0];

export const createFormHelper = <
	GeneratedSubmitFunction extends SubmitFunction<any, any> = SubmitFunction
>(
	options: Partial<
		{
			minSubmitDuration: number;
			onBeforeSubmit: (param: SubmitFunctionParam) => void;
		} & (
			| {
					onAfterSubmit: (param: ReturnFunctionParam<GeneratedSubmitFunction>) => void;
					updateOptions: never;
			  }
			| {
					onAfterSubmit: never;
					updateOptions: { reset?: boolean; invalidateAll?: boolean };
			  }
		)
	> = {}
) => {
	// NOTE: If the user explicitly provides `undefined` as an option value,
	// the spread operator will override the default value with `undefined`.
	// This behavior matches the existing type definition.
	options = { minSubmitDuration: 1000, ...options };

	let state = $state<FormState>('standby');
	return {
		get state() {
			return state;
		},
		set state(newState: FormState) {
			state = newState;
		},
		submitFunction: (async (p: SubmitFunctionParam) => {
			state = 'submitting';
			p.controller.signal.addEventListener('abort', () => (state = 'standby'));
			const timer =
				options.minSubmitDuration &&
				new Promise((resolve) => setTimeout(resolve, options.minSubmitDuration));
			await options.onBeforeSubmit?.(p);
			return async (p1) => {
				await timer;
				await (options.onAfterSubmit
					? options.onAfterSubmit(p1)
					: p1.update(options.updateOptions));
				state = 'submitted';
			};
		}) satisfies SubmitFunction
	};
};
