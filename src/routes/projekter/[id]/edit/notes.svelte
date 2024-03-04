<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Save, Trash, Pen, BadgeInfo } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Alert from '$lib/components/ui/alert';

	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import SaveOrDisgardButtons from './SaveOrDisgardButtons.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="mb-8">
	{#if ProjectEditMode.notes === FieldToEdit}
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
			action="?/updateNotes"
		>
			<div class="grid w-full max-w-md items-center gap-1.5">
				<Label for="notes">Noter</Label>
				<Textarea
					placeholder="notes"
					value={form?.formData?.notes ?? project.notes ?? ''}
					name="notes"
					class="min-h-32 w-full"
				/>
			</div>
			<SaveOrDisgardButtons {FieldToEdit} />
		</form>
	{:else}
		<div class="flex items-center gap-2">
			<h2 class=" text-xl font-bold">Underviser Notater</h2>
			<Button
				size="icon"
				variant="ghost"
				on:click={() => {
					FieldToEdit = ProjectEditMode.notes;
				}}
			>
				<Pen class="h-5 w-5" />
			</Button>
		</div>
		<Alert.Root class=" w-fit ">
			<BadgeInfo class="h-4 w-4" />
			<Alert.Title>Note til vejledere.</Alert.Title>
			<Alert.Description class="max-w-[40rem]"
				>{form?.formData?.notes ||
					project.notes ||
					'Ingen notater at vise endu...'}</Alert.Description
			>
		</Alert.Root>
	{/if}
</div>
