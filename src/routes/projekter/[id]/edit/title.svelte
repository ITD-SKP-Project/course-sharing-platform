<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Save, Trash, Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
</script>

<div class="mb-8 flex gap-2">
	{#if ProjectEditMode.title === FieldToEdit}
		<form
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					FieldToEdit = ProjectEditMode.none;
					update();
				};
			}}
			class="flex w-full flex-col gap-2"
			method="POST"
			action="?/updateTitle"
		>
			<div class="grid w-full max-w-md items-center gap-1.5">
				<Label for="title">Title</Label>
				<Input
					type="text"
					placeholder="title"
					value={form?.formData?.title ?? project.title}
					name="title"
				/>
			</div>

			{#if form?.validationErrors?.title}
				<p class="text-red-500">{form?.validationErrors?.title}</p>
			{/if}
			<div class="flex gap-2">
				<Button
					size="icon"
					variant="destructive"
					on:click={() => {
						FieldToEdit = ProjectEditMode.none;
					}}
				>
					<Trash class="h-5 w-5" />
				</Button>
				<Button
					size="icon"
					class="bg-green-500 hover:bg-green-600 focus:ring-green-500"
					type="submit"
				>
					<Save class="h-5 w-5" />
				</Button>
			</div>
		</form>
	{:else}
		<div class="flex flex-col">
			<h2 class="mb-1 text-xl font-bold">Title</h2>
			<h1 class="text-4xl font-semibold">{form?.formData?.title ?? project.title}</h1>
		</div>
		<Button
			size="icon"
			variant="ghost"
			on:click={() => {
				FieldToEdit = ProjectEditMode.title;
			}}
		>
			<Pen class="h-5 w-5" />
		</Button>
	{/if}
</div>
