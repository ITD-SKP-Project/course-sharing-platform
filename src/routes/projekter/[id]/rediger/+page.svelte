<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Title from './title.svelte';
	import Description from './description.svelte';
	import Notes from './notes.svelte';
	import Professions from './professions.svelte';
	import Subjects from './subjects.svelte';
	import Resources from './resources.svelte';
	import Files from './files.svelte';
	import Authors from './authors.svelte';
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;

	export let form;

	let project = data.project as Project;
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);
	import { months } from '$lib/index';
	import { ProjectEditMode } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import CourseLength from './courseLength.svelte';

	import { toast } from 'svelte-sonner';

	let FieldToEdit: ProjectEditMode = ProjectEditMode.none;
	$: loading = false;

	function handleUpdate() {
		setTimeout(() => {
			loading = false;
			if (!form?.validationErrors && form?.successMessage) {
				FieldToEdit = ProjectEditMode.none;
				if (form.successMessage) {
					toast('Handlingen lykkedes!', {
						description: form.successMessage
					});
				} else {
					toast('Fejl');
				}
			}
		}, 500);
	}
</script>

<main class="p-2 px-4 transition-all duration-500 sm:p-8 md:px-16">
	<div class="flex grid-cols-3 grid-rows-1 flex-col justify-between gap-4 lg:grid">
		<div class="col-span-2">
			<!-- ? title -->
			<Title {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />
			<!-- ? Description -->
			<Description {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />

			<!-- ? Noter -->
			<Notes {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />

			<!-- ? Professions -->
			<Professions {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />

			<!-- ? Subjects -->
			<Subjects {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />

			<!-- ? Resources -->
			<Resources {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />
		</div>

		<!-- ? infobox -->
		<Card.Root
			class="sticky top-24 mb-4 mt-8 h-fit min-w-72 border-primary bg-primary text-primary-foreground lg:ml-auto lg:mt-0 lg:max-w-96"
		>
			<Card.Header>
				<Card.Title>Info</Card.Title>
			</Card.Header>

			<Card.Content class="m-0">
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<span class="text-sm font-semibold text-primary-foreground/75">Oprettet</span>
						<span class="text-sm"
							>{created_at.getDay()}.
							{months[created_at.getMonth()]}
							{created_at.getFullYear()}</span
						>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-sm font-semibold text-primary-foreground/75">Senest opdateret</span>
						<span class="text-sm"
							>{updated_at.getDay()}.
							{months[updated_at.getMonth()]}
							{updated_at.getFullYear()}</span
						>
					</div>
				</div>

				<div>
					<Separator class=" my-0 w-full bg-primary-foreground/25" />

					{#key FieldToEdit}
						<Authors
							on:update={() => {
								handleUpdate();
								location.reload();
							}}
							currentUser={data.user}
							{project}
							bind:form
							bind:loading
							bind:FieldToEdit
							users={data.users.filter((user) => user.id !== data.user.id)}
						/>
					{/key}

					<Separator class=" my-0 w-full bg-primary-foreground/25" />
					<!-- ? course length -->
					<CourseLength {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />
					<Separator class=" my-0 w-full bg-primary-foreground/25" />
				</div>

				<!-- files -->
				<Files {project} {form} bind:loading bind:FieldToEdit on:update={handleUpdate} />
			</Card.Content>
		</Card.Root>
	</div>
</main>

<!-- Not direcly visible in the ui -->
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
<Dialog.Root open={form?.serverError ? true : false}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ups. Der er sket en fejl 500 på serveren.</Dialog.Title>
			<Dialog.Description>
				{form?.serverError}
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
