<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormHelper } from '$lib/index.svelte';
	import type { SubmitFunction } from './a/$types.js';

	let { children } = $props();
	let submittedAt = $state<Date>();

	const f = createFormHelper<SubmitFunction>({
		minSubmitDuration: 0,
		onAfterSubmit: async ({ result }) => {
			if (result.type !== 'success') return;
			if (!result.data) return;
			submittedAt = result.data.submittedAt;
		},
	});
</script>

<form use:enhance={f.submitFunction} method="post" action="/a">
	{#if submittedAt}
		<p>
			Last submitted at
			<time datetime={submittedAt.toISOString()}>
				{submittedAt.toLocaleTimeString()}
			</time>
		</p>
	{/if}
	<button>Submit</button>
</form>

<hr />

{@render children()}
