<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import DowdloadLink from '$lib/components/DowdloadLink.svelte';

	import Title from './title.svelte';
	import Description from './description.svelte';
	import Notes from './notes.svelte';
	import Professions from './professions.svelte';
	import Subjects from './subjects.svelte';
	import Resources from './resources.svelte';

	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;
	export let form;

	let project = data.project as Project;
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);
	import { months } from '$lib/index';

	import { ProjectEditMode } from '$lib/types';

	let FieldToEdit: ProjectEditMode = ProjectEditMode.none;

	let loading = false;

	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';

	$: if (form?.successMessage) {
		FieldToEdit = ProjectEditMode.none;
		toast('Handlingen lykkedes!', {
			description: form.successMessage
		});
	}

	// let subjectData = data.project?.subjects?.split('[ENTER]') || [];
	// let subjectDataBackup = subjectData;
</script>

<Toaster />
<main class="p-2 px-4 transition-all duration-500 sm:p-8 md:px-16">
	<div class="flex grid-cols-3 grid-rows-1 flex-col justify-between gap-4 lg:grid">
		<div class="col-span-2">
			<!-- ? title -->
			<Title {project} {form} {loading} {FieldToEdit} />
			<!-- ? Description -->
			<Description {project} {form} {loading} {FieldToEdit} />

			<!-- ? Noter -->
			<Notes {project} {form} {loading} {FieldToEdit} />

			<!-- ? Professions -->
			<Professions {project} {form} {loading} {FieldToEdit} />

			<!-- ? Subjects -->
			<Subjects {project} {form} {loading} {FieldToEdit} />

			<!-- ? Resources -->
			<Resources {project} {form} {loading} {FieldToEdit} />
		</div>

		<!-- ? infobox -->
		<Card.Root
			class="sticky top-24 mb-4 mt-8 h-fit min-w-72 border-primary bg-primary text-primary-foreground lg:ml-auto lg:mt-0 lg:max-w-96"
		>
			<Card.Header class="pb-4">
				<Card.Title>Info</Card.Title>
			</Card.Header>

			<Card.Content>
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
			</Card.Content>
			<Separator class="mx-auto my-0 w-5/6 bg-primary-foreground/25" />

			<span class="p-6 text-sm font-semibold text-primary-foreground/75">Forfattere</span>

			<Card.Content>
				<div
					id="authors"
					class="p.2 mt-2 flex w-full flex-col flex-wrap gap-x-2 gap-y-2 rounded-md border-secondary"
				>
					{#if project.authors && project.authors.length > 0}
						{#each project.authors as author}
							{#if author?.user}
								<a href="/?forfatter={author.user.firstname}-{author.user.lastname}">
									<div class="flex min-w-max items-center gap-2">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/75 text-secondary-foreground"
										>
											{author.user.firstname ? author.user.firstname[0] : ''}{author.user.lastname
												? author.user.lastname[0]
												: ''}
										</div>
										<span class="ml-2 font-medium"
											>{author.user.firstname}
											{author.user.lastname}
										</span>
									</div>
								</a>
							{/if}
						{/each}
					{/if}
				</div>
			</Card.Content>

			<Separator class="mx-auto my-0 w-5/6 bg-primary-foreground/25" />

			<span class="p-6 text-sm font-semibold text-primary-foreground/75">Projekt links</span>

			<Card.Content>
				{#if project.files}
					{#each project.files as file}
						<DowdloadLink pathName={`${project.id}/${file.name}`}>{file.name}</DowdloadLink>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
