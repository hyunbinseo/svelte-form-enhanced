<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormHelper } from '$lib/index.svelte';

	let { form } = $props();

	const f = createFormHelper();

	const getDate = (date = new Date()) =>
		[
			date.getFullYear(),
			(date.getMonth() + 1).toString().padStart(2, '0'),
			date.getDate().toString().padStart(2, '0'),
		].join('-');
</script>

<span>form state: {f.state}</span>

<form method="post" use:enhance={f.submitFunction}>
	<!-- By default, `use:enhance` resets the form after submission. -->
	<!-- In this process, fields' default values are not respected. -->
	<!-- This can be worked around by recreating the HTML elements. -->
	<!-- Reference https://github.com/sveltejs/svelte/issues/8220 -->
	{#if f.state !== 'submitted'}
		{@const today = getDate()}
		<label>
			<span>Date</span>
			<input type="date" name="date" value={today} min={today} required />
		</label>
		<label>
			<span>Type</span>
			<select name="item" required>
				<option>Breakfast</option>
				<option>Lunch</option>
				<option>Dinner</option>
			</select>
		</label>
		<button disabled={f.state === 'submitting'}>
			{f.state !== 'submitting' ? 'Make Reservation' : 'Processing'}
		</button>
	{:else if form}
		<span>Reservation {form.success ? 'Succeeded' : 'Failed'}</span>
		<button type="button" onclick={() => (f.state = 'standby')}>Make Another Reservation</button>
	{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
		width: fit-content;
	}
</style>
