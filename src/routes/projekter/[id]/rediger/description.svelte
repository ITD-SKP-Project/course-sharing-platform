<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Save, Trash, Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import SaveOrDisgardButtons from './SaveOrDisgardButtons.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="mb-8 flex w-full gap-2">
	{#if ProjectEditMode.description === FieldToEdit}
		<form
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					dispatch('update');
					update();
				};
			}}
			class="flex w-full flex-col gap-2"
			method="POST"
			action="?/updateDescription"
		>
			<div class="grid w-full max-w-md items-center gap-1.5">
				<Label for="description">Beskrivelse</Label>

				<Textarea
					placeholder="description"
					value={form?.formData?.description || project.description}
					name="description"
					class="w-full"
				/>
			</div>
			<SaveOrDisgardButtons bind:FieldToEdit />
		</form>
	{:else}
		<div class="flex flex-col">
			<h2 class="mb-1 text-xl font-bold">Beskrivelse</h2>
			<p class="text max-w-[40rem] font-light leading-7">
				{form?.formData?.description || project.description}
			</p>
		</div>
		<Button
			size="icon"
			variant="ghost"
			on:click={() => {
				FieldToEdit = ProjectEditMode.description;
			}}
		>
			<Pen class="h-5 w-5" />
		</Button>
	{/if}
</div>
