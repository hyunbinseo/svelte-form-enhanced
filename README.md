# Svelte Form Enhanced

A better `use:enhance` experience with automatic state management.

## Features

Requires Svelte v5 and runes mode.

- **Managed State**: Tracks `standby`, `submitting`, and `submitted` states
- **Better UX**: Ensures a minimum submission duration for loading spinners
- **Intuitive DX**: Provides `onBeforeRequest` and `onAfterResponse` callbacks

## Quick Start

```shell
pnpm add svelte-form-enhanced -D
npm i svelte-form-enhanced -D
```

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { createFormHelper } from 'svelte-form-enhanced';
  const f = createFormHelper();
</script>

<!-- Maintains submitting state for 1 second (customizable) -->
<form method="post" use:enhance={f.submitFunction}>
  <!-- Use the submitting state to show loading UI: -->
  <button disabled={f.state === 'submitting'} class="disabled:btn-spinner">
    {f.state === 'submitting' ? 'Submitting' : 'Submit'}
  </button>
</form>
```

```ts
type FormState = 'standby' | 'submitting' | 'submitted';
```

## Generated Types

```svelte
<script lang="ts">
  import { createFormHelper } from 'svelte-form-enhanced';
  import type { SubmitFunction } from './$types.js';

  const f = createFormHelper<SubmitFunction>({
    // The `ActionResult` object is now typed.
    onAfterSubmit: ({ result }) => {},
  });
</script>
```

## Options

<!-- prettier-ignore -->
```ts
const f = createFormHelper({ /* options */ });
```

```ts
type Options = Partial<{
  minSubmitDuration: number; // defaults to 1000(ms)
  onBeforeSubmit: (param) => void;
  onAfterSubmit: (param) => void;
  updateOptions: { reset?: boolean; invalidateAll?: boolean };
}>;
```

The function provided to the `use:enhance` has been separated into two:

```svelte
<script>
  const f = createFormHelper({
    onBeforeSubmit: () => {
      console.log('Before submit');
    },
    onAfterSubmit: async ({ update }) => {
      await update(); // default logic
      console.log('After submit');
    },
  });
</script>

<form use:enhance={f.submitFunction}></form>
```

```svelte
<form
  use:enhance={() => {
    console.log('Before submit');
    return async ({ update }) => {
      await update(); // default logic
      console.log('After submit');
    };
  }}
></form>
```

## Advanced Usage

### Form on Layout

> `use:enhance` will update the `form` property, `page.form` and `page.status` on a successful or invalid response, but **only if the action is on the same page you’re submitting from.** — [SvelteKit Docs](https://svelte.dev/docs/kit/form-actions#Progressive-enhancement)

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { createFormHelper } from 'svelte-form-enhanced';
  import type { SubmitFunction } from './a/$types.js';

  let submittedAt = $state<Date>();

  const f = createFormHelper<SubmitFunction>({
    onAfterSubmit: async ({ result }) => {
      if (result.type !== 'success') return; // handle error
      if (!result.data) return; // type guard
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
```

```ts
// src/routes/a/+page.server.ts
export const actions = {
  default: () => ({ submittedAt: new Date() }),
};
```

### Multiple Submit Buttons

When a form contains multiple submit buttons:

- All submit buttons are disabled during form submission
- Only the clicked submit button displays a loading spinner

```svelte
<script lang="ts">
  const f = createFormHelper({
    onBeforeSubmit: ({ submitter }) => {
      submitter?.classList.add('disabled:btn-spinner');
    },
    onAfterSubmit: async ({ submitter, update }) => {
      await update();
      submitter?.classList.remove('disabled:btn-spinner');
    },
  });
</script>

<form method="post" use:enhance={f.submitFunction}>
  <!-- Loading spinner only appears on the button that is clicked -->
  <button disabled={f.state === 'submitting'} formaction="?/a">A</button>
  <button disabled={f.state === 'submitting'} formaction="?/b">B</button>
</form>
```
