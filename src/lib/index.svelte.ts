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
			delay: number;
			disableSubmitter: boolean;
			onBeforeRequest: (param: SubmitFunctionParam) => void;
		} & (
			| {
					onAfterResponse: (param: ReturnFunctionParam<GeneratedSubmitFunction>) => void;
					updateOptions?: never;
			  }
			| {
					onAfterResponse?: never;
					updateOptions: { reset?: boolean; invalidateAll?: boolean };
			  }
		)
	> = {}
) => {
	options = { delay: 1000, disableSubmitter: true, ...options };
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
			const timer = options.delay && new Promise((resolve) => setTimeout(resolve, options.delay));
			await options.onBeforeRequest?.(p);
			state = 'submitting';
			return async (p1) => {
				await timer;
				await (options.onAfterResponse
					? options.onAfterResponse(p1)
					: p1.update(options.updateOptions));
				if (options.disableSubmitter && isButtonOrInputEl(p.submitter))
					p.submitter.disabled = false;
				state = 'submitted';
			};
		}) satisfies SubmitFunction
	};
};
