<script lang="ts">
	import DataTable from './data-table.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	console.log(data);
</script>

<div class="container mx-auto py-10">
	<h1 class="mb-4 text-3xl font-bold">Users</h1>
	<DataTable data={data.users} />
</div>
