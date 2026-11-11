<script lang="ts">
	import type { PageProps } from './$types';
	import { orpc } from '#lib/orpc.ts';
	import { createQuery } from '@tanstack/svelte-query';

	let { data }: PageProps = $props();

	const privateDataQuery = createQuery(() => orpc.privateData.queryOptions());
</script>

	<div>
		<h1>Dashboard</h1>
		<p>Welcome {data.user.name}</p>
		<p>API: {privateDataQuery.data?.message}</p>
	</div>
