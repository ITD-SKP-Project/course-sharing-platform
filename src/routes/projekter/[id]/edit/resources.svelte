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

	let resourcesArray: string[] = project.resources.split('[ENTER]') ?? [''];
	const resourcesArrayBackup = resourcesArray;

	let reRender = false;
</script>

<div class="mt-16">
	{#if ProjectEditMode.resources === FieldToEdit}
		<form
			action="?/updateResources"
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					FieldToEdit = ProjectEditMode.none;
					update();
				};
			}}
		>
			<div class="flex flex-col gap-2">
				<div class="mt-2 flex items-center gap-2">
					<Label for="resources" class="text-lg">Ressourcer</Label>
					<Button
						size="icon"
						variant="destructive"
						on:click={() => {
							FieldToEdit = ProjectEditMode.none;
							resourcesArray = resourcesArrayBackup;
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
					{#each resourcesArray as item, index}
						<div class="flex gap-2">
							<Input
								on:input={(e) => {
									resourcesArray[index] = e.target?.value;
								}}
								type="text"
								name="resources-{index}"
								value={resourcesArray[index] ?? form?.formData[`resources-${index}`] ?? ''}
								placeholder="Router 2901"
								required={index == 0}
							/>
							{#if index != 0}
								<Button
									size="icon"
									class="aspect-square"
									variant="destructive"
									on:click={() => {
										resourcesArray = resourcesArray.toSpliced(index, 1); // Remove the item at the specified index
										resourcesArray = resourcesArray;
										reRender = !reRender;
									}}
								>
									<X class=" h-4 w-4" />
								</Button>
							{/if}
						</div>
					{/each}
				{/key}

				<Button
					class=" w-fit items-center justify-start"
					type="button"
					on:click={() => {
						resourcesArray.push('');
						resourcesArray = [...resourcesArray];
					}}
				>
					<Plus class="mr-1.5 h-4 w-4" />
					Tilføj ressourcer
				</Button>
			</div>
		</form>
	{:else if project.resources}
		<Collapsible.Root class="w-fit min-w-52">
			<div class="flex items-center justify-between space-x-4">
				<h2 class="mb-1 text-xl font-bold">Ressourcer</h2>
				{#if toArrayOfStrings(form?.formData, 'resources-').length > 1 || project.resources.split('[ENTER]').length > 1}
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
				{/if}
			</div>
			<div class="rounded-md border px-4 py-3 font-mono text-sm">
				{toArrayOfStrings(form?.formData, 'resources-')[0] || project.resources.split('[ENTER]')[0]}
			</div>
			<Collapsible.Content class="space-y-2">
				{#key form}
					{#if form?.successMessage && toArrayOfStrings(form?.formData, 'resources-').length > 0}
						{#each toArrayOfStrings(form?.formData, 'resources-').splice(1) as resource, index}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
								{resource}
							</div>
						{/each}
					{:else}
						{#each project.resources.split('[ENTER]').splice(1) as resource, index}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
								{resource}
							</div>
						{/each}
					{/if}
				{/key}
			</Collapsible.Content>
		</Collapsible.Root>
		<Button
			size="icon"
			variant="ghost"
			on:click={() => {
				FieldToEdit = ProjectEditMode.resources;
			}}
		>
			<Pen class="h-5 w-5" />
		</Button>
	{/if}
</div>
