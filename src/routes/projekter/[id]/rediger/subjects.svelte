<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';
	import { toArrayOfStrings } from '$lib/index';

	import { Save, Trash, Pen, X, Plus, ChevronDown, ChevronUp } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';

	let subjectsArray: string[] = project.subjects.split('[ENTER]') ?? [''];
	const subjectsArrayBackup = subjectsArray;

	let reRender = false;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="mt-16">
	{#if ProjectEditMode.subjects === FieldToEdit}
		<form
			action="?/updateSubjects"
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					dispatch('update');
					update();
				};
			}}
		>
			<div class="flex flex-col gap-2">
				<div class="mt-2 flex items-center gap-2">
					<Label for="subjects" class="text-lg">Fagområder</Label>
					<Button
						size="icon"
						variant="destructive"
						on:click={() => {
							FieldToEdit = ProjectEditMode.none;
							subjectsArray = subjectsArrayBackup;
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
				{#key form || reRender}
					{#each subjectsArray as item, index}
						<div class="flex gap-2">
							<Input
								on:input={(e) => {
									subjectsArray[index] = e.target?.value;
								}}
								type="text"
								name="subjects-{index}"
								value={subjectsArray[index] ?? form?.formData[`subjects-${index}`] ?? ''}
								placeholder="Router 2901"
								required={index == 0}
							/>
							{#if index != 0}
								<Button
									size="icon"
									class="aspect-square"
									variant="destructive"
									on:click={() => {
										subjectsArray = subjectsArray.toSpliced(index, 1); // Remove the item at the specified index
										subjectsArray = subjectsArray;
										reRender = !reRender;
									}}
								>
									<X class=" h-4 w-4" />
								</Button>
							{/if}
						</div>
						{#if form?.validationErrors?.[`subjects-${index}`]}
							<p class="text-red-500">{form?.validationErrors?.[`subjects-${index}`]}</p>
						{/if}
					{/each}
					{#if form?.validationErrors?.[`subjects`]}
						<p class="text-red-500">{form?.validationErrors?.[`subjects`]}</p>
					{/if}
				{/key}

				<Button
					class=" w-fit items-center justify-start"
					type="button"
					on:click={() => {
						subjectsArray.push('');
						subjectsArray = [...subjectsArray];
					}}
				>
					<Plus class="mr-1.5 h-4 w-4" />
					Tilføj fagområde
				</Button>
			</div>
		</form>
	{:else}
		<Collapsible.Root class="w-fit min-w-52">
			<div class="flex items-center justify-between space-x-4">
				<div class="flex items-center gap-2">
					<h2 class="mb-1 text-xl font-bold">Fagområder</h2>
					<Button
						size="icon"
						variant="ghost"
						on:click={() => {
							FieldToEdit = ProjectEditMode.subjects;
						}}
					>
						<Pen class="h-5 w-5" />
					</Button>
				</div>

				{#key form}
					<Collapsible.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0">
							{#if builder['data-state'] === 'open'}
								<ChevronDown class="h-4 w-4 rotate-180 transform" />
							{:else}
								<ChevronUp class="h-4 w-4 rotate-180 transform" />
							{/if}
							<span class="sr-only">Toggle</span>
						</Button>
					</Collapsible.Trigger>
				{/key}
			</div>
			<div class="rounded-md border px-4 py-3 font-mono text-sm">
				{#if toArrayOfStrings(form?.formData, 'subjects-').length > 1 || project.subjects.split('[ENTER]').length > 1}
					{toArrayOfStrings(form?.formData, 'subjects-')[0] || project.subjects.split('[ENTER]')[0]}
				{:else}
					<div class="">Dette projekt har ingen Fagområder</div>
				{/if}
			</div>
			<Collapsible.Content class="space-y-2">
				{#key form}
					{#if form?.successMessage && toArrayOfStrings(form?.formData, 'subjects-').length > 0}
						{#each toArrayOfStrings(form?.formData, 'subjects-').splice(1) as resource, index}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
								{resource}
							</div>
						{/each}
					{:else}
						{#each project.subjects.split('[ENTER]').splice(1) as subject, index}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
								{subject}
							</div>
						{/each}
					{/if}
				{/key}
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}
</div>
