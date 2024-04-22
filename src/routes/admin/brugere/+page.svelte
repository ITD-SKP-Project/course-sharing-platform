<script lang="ts">
	import DataTable from './data-table.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	export let form;
	import { editUserFormResponse } from '$lib/stores';
	import { Separator } from '$lib/components/ui/separator';
	$: if (form) editUserFormResponse.set(form);
</script>

<div class="container mx-auto py-10">
	<h1 class="mb-4 text-3xl font-bold">Bruger administration</h1>
	<Separator class="my-4" />
	<DataTable data={data.users} currentUser={data.user} />
</div>
