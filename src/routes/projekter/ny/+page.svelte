<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { XIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import AuthorForm from '$lib/components/create-project/authors.svelte';
	import ProfessionForm from '$lib/components/create-project/professions.svelte';

	import { z } from 'zod';

	// { username: string }

	import type {
		Project,
		ProjectAuthor,
		Profession,
		User,
		ProjectAuthorCreation,
		ProjectProfessionCreation
	} from '$lib/types';
	import { onMount } from 'svelte';

	let projectAuthors: ProjectAuthorCreation[];
	const ProjectAuthors = z.array(
		z.object({
			user_id: z.number().gt(0), //greater than 0
			authority_level: z.number().gte(0), //greater than 0
			project_id: z.number().optional()
		})
	);

	let projectProfessions: ProjectProfessionCreation[];
	const ProjectProfessions = z.array(
		z.object({
			skill_level: z.string().min(2, { message: 'Niveau' }), //greater than 0
			profession_id: z.number().gt(0), //greater than 0
			project_id: z.number().optional()
		})
	);
	let projektInfo = {
		title: '',
		description: '',
		subjects: [] as string[],
		resources: [] as string[],

		professions: {
			'It-supporter': {
				active: false,
				skill_level: ''
			},
			'Datatekniker programmering': {
				active: false,
				skill_level: ''
			},
			'Datatekniker infrastruktur': {
				active: false,
				skill_level: ''
			}
		},
		live: false
	};

	//save the project to localstorage so the user can continue later
	let loaded = false;
	let users = (data.users as User[]) || undefined;

	onMount(() => {
		loaded = true;
		if (localStorage.getItem('projectInfo')) {
			const raw = localStorage.getItem('projectInfo');
			if (!raw) return;
			const json = JSON.parse(raw);
			projektInfo = json;
			//remove users that are already in projektInfo.authors
			if (users) {
				users = users.filter((user) => {
					let found = false;
					projectAuthors.forEach((author) => {
						if (author.user_id === user.id) {
							found = true;
						}
					});
					return !found;
				});
			}
			users = users || [];
		}
	});
	$: if (loaded) {
		localStorage.setItem('projectInfo', JSON.stringify(projektInfo));
	}

	let subjectInputValue = '';
	let resourceInputValue = '';
	let error = '';

	const upload = async () => {
		try {
			ProjectAuthors.parse(projectAuthors);
			ProjectProfessions.parse(projectProfessions);
		} catch (error) {
			console.log(error);
		}
	};
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<div class="mx-auto">
		<h1 class="text-4xl font-semibold">Opret et nyt projekt.</h1>
		<p class="text mt-2">Udfyld alle felterne, og tryk på offentliggør for at lægge det op.</p>

		<form class=" mt-8 flex w-full max-w-lg flex-col gap-12">
			<!-- ? title -->
			<div class="flex w-full flex-col gap-1.5">
				<Label for="title" class="text-lg">Title</Label>
				<Input bind:value={projektInfo.title} type="title" id="title" placeholder="Title" />
				<p class="text-sm text-muted-foreground">Titlen på projektets.</p>
			</div>
			<!-- ? description -->
			<div class="flex w-full flex-col gap-1.5">
				<Label class="text-lg" for="description">Description</Label>
				<Textarea bind:value={projektInfo.description} id="description" placeholder="Description" />
				<p class="text-sm text-muted-foreground">
					En kort forklaring af projektet. Hvad handler det om?
				</p>
			</div>
			<!-- ? professions -->
			<ProfessionForm bind:projectProfessions />
			<!-- ? authors -->
			<AuthorForm bind:projectAuthors bind:users />
			<!-- ? subjects -->
			<div class="flex flex-col gap-4">
				<form
					on:submit|preventDefault={() => {
						error = '';
						if (subjectInputValue === '') return;
						if (projektInfo.subjects.includes(subjectInputValue)) {
							error = `${subjectInputValue} er allerede tilføjet.`;
							return;
						}
						projektInfo.subjects.push(subjectInputValue);
						subjectInputValue = '';
						projektInfo = projektInfo;
					}}
				>
					<div class="flex w-full flex-col gap-1.5">
						<Label class="text-lg" for="resurse">Fag</Label>
						<div class="flex gap-1">
							<Input bind:value={subjectInputValue} type="fag" id="fag" placeholder="Cisco ITN" />
							<Button
								on:click={() => {
									error = '';
									if (subjectInputValue === '') return;
									if (projektInfo.subjects.includes(subjectInputValue)) {
										error = `${subjectInputValue} er allerede tilføjet.`;
										return;
									}
									projektInfo.subjects.push(subjectInputValue);
									subjectInputValue = '';
									projektInfo = projektInfo;
								}}
								variant="secondary">Tilføj</Button
							>
						</div>
						{#if error}
							<p class="text-destructive">{error}</p>
						{/if}
					</div>
				</form>
				{#if projektInfo.subjects && projektInfo.subjects.length > 0}
					<Card.Root class="bg-secondary p-0">
						<Card.Content class="flex flex-wrap gap-2 p-2">
							{#each projektInfo.subjects as subject (subject)}
								<Button
									class="items-center shadow-md"
									on:click={() => {
										projektInfo.subjects.splice(projektInfo.subjects.indexOf(subject), 1);
										projektInfo = projektInfo;
									}}
									>{subject}
									<XIcon class="h-4 w-4 translate-x-2"></XIcon>
								</Button>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
			<!-- ? resources -->
			<div class="flex flex-col gap-4">
				<form
					on:submit|preventDefault={() => {
						error = '';
						if (resourceInputValue === '') return;
						if (projektInfo.resources.includes(resourceInputValue)) {
							error = `${resourceInputValue} er allerede tilføjet.`;
							return;
						}
						projektInfo.resources.push(resourceInputValue);
						resourceInputValue = '';
						projektInfo = projektInfo;
					}}
				>
					<div class="flex w-full flex-col gap-1.5">
						<Label class="text-lg" for="resource">Resurser</Label>
						<div class="flex gap-1">
							<Input
								bind:value={resourceInputValue}
								type="resource"
								id="resource"
								placeholder="Raspberry pi"
							/>
							<Button
								on:click={() => {
									error = '';
									if (resourceInputValue === '') return;
									if (projektInfo.resources.includes(resourceInputValue)) {
										error = `${resourceInputValue} er allerede tilføjet.`;
										return;
									}
									projektInfo.resources.push(resourceInputValue);
									resourceInputValue = '';
									projektInfo = projektInfo;
								}}
								variant="secondary">Tilføj</Button
							>
						</div>
						{#if error}
							<p class="text-destructive">{error}</p>
						{/if}
					</div>
				</form>
				{#if projektInfo.resources && projektInfo.resources.length > 0}
					<Card.Root class="bg-secondary p-0">
						<Card.Content class="flex flex-wrap gap-2 p-2">
							{#each projektInfo.resources as resource (resource)}
								<Button
									class="items-center shadow-md"
									on:click={() => {
										projektInfo.resources.splice(projektInfo.resources.indexOf(resource), 1);
										projektInfo = projektInfo;
									}}
									>{resource}
									<XIcon class="h-4 w-4 translate-x-2"></XIcon>
								</Button>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
			<Button on:click={upload}>Udgiv projekt</Button>
		</form>
	</div>
</main>
