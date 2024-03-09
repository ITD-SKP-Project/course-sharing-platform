<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Save, Trash, Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import SaveOrDisgardButtons from './SaveOrDisgardButtons.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

{#if ProjectEditMode.course_length === FieldToEdit}
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
		action="?/updateCourseLength"
	>
		<div class="flex w-full flex-col gap-1.5">
			<span class="text-sm font-semibold text-primary-foreground/75">Tidforbrug</span>
			<Input
				name="course_length"
				value={form?.formData?.course_length ?? project.course_length}
				id="course_length"
				required={true}
				placeholder="f.eks. 2 Uger"
			/>
			<p class="text-sm text-muted-foreground">Hvor lang tid tager det at lave projektet?</p>
			{#if form?.validationErrors?.course_length}
				<p class="text-red-500">{form?.validationErrors?.course_length}</p>
			{/if}
		</div>

		<SaveOrDisgardButtons bind:FieldToEdit />
	</form>
{:else}
	<div class="flex flex-col">
		<span class="text-sm font-semibold text-primary-foreground/75">Tidforbrug</span>
		<p class="text max-w-[40rem] font-light leading-7">
			{form?.formData?.course_length || project.course_length}
		</p>
	</div>
	<Button
		size="icon"
		variant="ghost"
		on:click={() => {
			FieldToEdit = ProjectEditMode.course_length;
		}}
	>
		<Pen class="h-5 w-5" />
	</Button>
{/if}
