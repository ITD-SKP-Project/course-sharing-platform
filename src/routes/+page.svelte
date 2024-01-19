<script lang="ts">
	//UI
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Star, Cross2 } from 'radix-icons-svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import Label from '$lib/components/ui/label/label.svelte';
	import { derived, writable, type Writable } from 'svelte/store';
	import * as Popover from '$lib/components/ui/popover';

	//functionality
	import type { Project } from '$lib/types';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	export let data: PageData;
	import { goto } from '$app/navigation';
	let titleValue = '';
	//url search params
	const updateSearchParams = (key: string, value: string) => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(key, value);
		goto(`?${searchParams.toString()}`);
	};
	const projects: Writable<Project[]> = writable(data.projects);
	// Filter criteria
	const filters = writable({
		//apply search params on load
		authorName: ($page.url.searchParams.get('forfatter') as string) ?? (null as null),
		title: null as string | null,
		likes: null as number | null,
		professionName: $page.url.searchParams.get('fag') as string | null
	});
	// Derived store for filtered projects
	const filteredProjects = derived([projects, filters], ([$projects, $filters]) =>
		$projects.filter((project) => {
			return (
				//filter author.user (firstname-lastname)
				(!$filters.authorName ||
					project.authors?.some(
						(author) => author.user?.firstname + '-' + author.user?.lastname == $filters.authorName
					)) &&
				//filter title
				(!$filters.title ||
					project.title.toLocaleLowerCase().includes($filters.title?.toLocaleLowerCase())) &&
				//filter profession.professionName
				//if any of the projects profession.profession matches with the $filters.professionName
				(!$filters.professionName ||
					project.professions?.some((prjct) => prjct?.profession_name == $filters.professionName))
			);
		})
	);
	function updateFilter(field: string, value: number | null | string) {
		filters.update((currentFilters) => ({ ...currentFilters, [field]: value }));
	}
</script>

<svelte:head>
	<title>Projekter</title>
	<meta name="description" content="Opdag alle projekterne fra projekt banken." />
</svelte:head>

<main class="px-8 pb-8 pt-2">
	<h1 class="text-3xl font-bold">Projekter</h1>
	<Separator class="my-4" />
	<div class="mb-4 flex w-full items-center justify-between">
		<div class="flex w-fit">
			<form
				on:submit|preventDefault={() => {
					updateSearchParams('title', titleValue);
					updateFilter('title', titleValue);
				}}
			>
				<Input
					bind:value={titleValue}
					on:input={() => {
						if (!titleValue) {
							titleValue = '';
							updateSearchParams('title', '');
							updateFilter('title', null);
						}
					}}
					type="search"
					placeholder="Søg i projekter"
					class="w-full max-w-lg"
				/>
			</form>
		</div>
		<div class="flex gap-2">
			{#if $filters.title}
				<div class="flex flex-col gap-1.5">
					<Label for="email">Title</Label>
					<Button
						variant="outline"
						class="flex h-fit items-center gap-4"
						on:click={() => {
							titleValue = '';
							updateSearchParams('title', '');
							updateFilter('title', null);
						}}
					>
						{$filters.title}
						<Cross2 class="h-4 w-4" />
					</Button>
				</div>
			{/if}
			{#if $filters.authorName}
				<div class="flex flex-col gap-1.5">
					<Label for="email">Forfatter</Label>
					<Button
						variant="outline"
						class="flex h-fit items-center gap-4"
						on:click={() => {
							updateSearchParams('forfatter', '');
							updateFilter('authorName', null);
						}}
					>
						{$filters.authorName}
						<Cross2 class="h-4 w-4" />
					</Button>
				</div>
			{/if}
			{#if $filters.professionName}
				<div class="flex flex-col gap-1.5">
					<Label for="email">Uddannelse</Label>
					<Button
						variant="outline"
						class="flex h-fit items-center gap-4"
						on:click={() => {
							updateSearchParams('fag', '');
							updateFilter('professionName', null);
						}}
					>
						{$filters.professionName}
						<Cross2 class="h-4 w-4" />
					</Button>
				</div>
			{/if}
		</div>
	</div>

	<div class="g grid w-full gap-8">
		{#each $filteredProjects as project}
			<Card.Root class="flex  flex-col justify-between">
				<Card.Header>
					<Card.Title>{project.title}</Card.Title>
					<Card.Description>{project.description}</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-8">
					{#if project.authors}
						<div>
							<h4 class="font-medium text-foreground">Forfattere</h4>
							<div
								id="authors"
								class="p.2 mt-2 flex w-full flex-wrap gap-x-8 gap-y-4 rounded-md bg-secondary p-2"
							>
								{#each project.authors as projectAuthor}
									<Button
										on:click={() => {
											updateSearchParams(
												'forfatter',
												projectAuthor.user?.firstname + '-' + projectAuthor.user?.lastname ?? ''
											);
											updateFilter(
												'authorName',
												projectAuthor.user?.firstname + '-' + projectAuthor.user?.lastname ?? ''
											);
										}}
										variant="ghost"
										><div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
											>
												{projectAuthor.user?.firstname[0]}{projectAuthor.user?.lastname[0]}
											</div>
											<span class="ml-2 font-medium"
												>{projectAuthor.user?.firstname}
												{projectAuthor.user?.lastname}
											</span>
										</div></Button
									>
								{/each}
							</div>
						</div>
					{/if}

					{#if project.professions}
						<div>
							<h4 class="font-medium text-foreground">Uddannelser</h4>

							<div
								id="professions"
								class="p.2 mt-2 flex w-full flex-col gap-x-8 gap-y-4 rounded-md bg-secondary p-2"
							>
								{#each project.professions as profession}
									{#if profession.profession_name}
										<Button
											class="h-fit justify-start p-0"
											on:click={() => {
												console.log(profession.profession_name, 'profession.profession_name');
												updateSearchParams('fag', profession.profession_name ?? '');
												updateFilter('professionName', profession.profession_name ?? '');
											}}
											variant="ghost"
											><div class="flex items-center gap-2">
												<span class="ml-2 font-medium">{profession.profession_name} </span>
											</div></Button
										>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</Card.Content>
				<Card.Footer class="flex  justify-between">
					<div class="flex items-center gap-2">
						<Star class="h-5 w-5 text-secondary-foreground" />
						<span>{project.likes}</span>
					</div>
					<Button href="/projekter/{project.id}">Se mere</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</main>

<style>
	.g {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
</style>
