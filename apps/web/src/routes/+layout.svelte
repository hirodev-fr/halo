<script lang="ts">
    import { QueryClientProvider } from '@tanstack/svelte-query';
    import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
	import '../app.css';
    import { createQueryClient } from '#lib/orpc.ts';
    import Header from '../components/Header.svelte';

	const { children } = $props();
	const queryClient = createQueryClient();
</script>

<QueryClientProvider client={queryClient}>
    <div class="grid h-svh grid-rows-[auto_1fr]">
		<Header />
		<main class="overflow-y-auto">
			{@render children()}
		</main>
    </div>
    <SvelteQueryDevtools />
</QueryClientProvider>
