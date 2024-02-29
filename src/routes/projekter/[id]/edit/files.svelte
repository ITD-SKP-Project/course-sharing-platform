<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';
	import { toArrayOfStrings } from '$lib/index';

	import { Plus, X, Trash, Save, Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import DowdloadLink from '$lib/components/DowdloadLink.svelte';
	import SaveOrDisgardButtons from './SaveOrDisgardButtons.svelte';

	let numberOfFiles = [0];
</script>

{#if ProjectEditMode.files === FieldToEdit}
	<form
		enctype="multipart/form-data"
		class="flex flex-col gap-2"
		action="?/updateFiles"
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				location.reload();
				update();
			};
		}}
	>
		<Label for="file" class="pt-1 text-sm font-semibold text-primary-foreground/75"
			>Projektfiler</Label
		>
		<p class="text-sm text-primary-foreground/75">
			<strong class="text-primary-foreground">
				De nuværende filer vil blive <span class="text-primary-foreground underline"
					>overskrevet</span
				> hvis du uploader nye.
			</strong>
			Tip: giv filerne et beskrivende navn før upload.
		</p>
		{#each numberOfFiles as index}
			<div class="flex gap-2" id="files-{index}">
				<Input
					class="text-primary-foreground  file:text-primary-foreground"
					type="file"
					name={`files-${index}`}
					required={index == 0}
				/>
				{#if index != 0}
					<Button
						size="icon"
						class="aspect-square"
						variant="destructive"
						on:click={() => {
							const target = document.querySelector(`#files-${index}`);
							target?.remove();
						}}
					>
						<X class="h-4 w-4" />
					</Button>
				{/if}
			</div>

			{#if form?.validationErrors?.[`files-${index}`]}
				<p class="text-red-500">{form?.validationErrors?.[`files-${index}`]}</p>
			{/if}
		{/each}

		<Button
			class="mt-2 w-fit items-center justify-start"
			type="button"
			on:click={() => {
				numberOfFiles.push(numberOfFiles.length);
				numberOfFiles = [...numberOfFiles];
			}}
			variant="secondary"
		>
			<Plus class="mr-1.5 h-4 w-4" />
			Tilføj
		</Button>
		<SaveOrDisgardButtons {FieldToEdit} />
	</form>
{:else if project.files}
	<div class="flex items-center">
		<span class="text-sm font-semibold text-primary-foreground/75">Projekt links</span>
		<Button
			size="icon"
			variant="ghost"
			on:click={() => {
				FieldToEdit = ProjectEditMode.files;
			}}
		>
			<Pen class="h-5 w-5" />
		</Button>
	</div>
	{#if toArrayOfStrings(form?.formData?.files, 'files').length > 0}
		{#each toArrayOfStrings(form?.formData?.files, 'files') as file}
			<DowdloadLink pathName={`${project.id}/${file}`}>{file}</DowdloadLink>
		{/each}
	{:else}
		{#each project.files as file}
			<DowdloadLink pathName={`${project.id}/${file.name}`}>{file.name}</DowdloadLink>
		{/each}
	{/if}
{/if}
