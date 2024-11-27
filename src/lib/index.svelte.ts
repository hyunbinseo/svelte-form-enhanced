import type { SubmitFunction } from '@sveltejs/kit';

type FormState = 'standby' | 'submitting' | 'submitted';

type SubmitFunctionParam = Parameters<SubmitFunction>[0];

type ReturnFunctionParam<GeneratedSubmitFunction extends SubmitFunction> = //
	Parameters<Exclude<Awaited<ReturnType<GeneratedSubmitFunction>>, void>>[0];

const isButtonOrInputEl = (submitter: HTMLElement | null) =>
	submitter instanceof HTMLButtonElement || //
	submitter instanceof HTMLInputElement;

export const createFormHelper = <
	GeneratedSubmitFunction extends SubmitFunction<any, any> = SubmitFunction
>(
	options: Partial<
		{
			minSubmitDuration: number;
			disableSubmitter: boolean;
			onBeforeSubmit: (param: SubmitFunctionParam) => void;
		} & (
			| {
					onAfterSubmit: (param: ReturnFunctionParam<GeneratedSubmitFunction>) => void;
					updateOptions?: never;
			  }
			| {
					onAfterSubmit?: never;
					updateOptions: { reset?: boolean; invalidateAll?: boolean };
			  }
		)
	> = {}
) => {
	options = { minSubmitDuration: 1000, disableSubmitter: true, ...options };
	let state = $state<FormState>('standby');
	return {
		get state() {
			return state;
		},
		set state(newState: FormState) {
			state = newState;
		},
		submitFunction: (async (p: SubmitFunctionParam) => {
			p.controller.signal.addEventListener('abort', () => (state = 'standby'));
			if (options.disableSubmitter && isButtonOrInputEl(p.submitter)) p.submitter.disabled = true;
			const timer =
				options.minSubmitDuration &&
				new Promise((resolve) => setTimeout(resolve, options.minSubmitDuration));
			await options.onBeforeSubmit?.(p);
			state = 'submitting';
			return async (p1) => {
				await timer;
				await (options.onAfterSubmit
					? options.onAfterSubmit(p1)
					: p1.update(options.updateOptions));
				if (options.disableSubmitter && isButtonOrInputEl(p.submitter))
					p.submitter.disabled = false;
				state = 'submitted';
			};
		}) satisfies SubmitFunction
	};
};
