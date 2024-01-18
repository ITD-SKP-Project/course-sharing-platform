<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	console.log(data);
	import { page } from '$app/stores';
	$: authorId = $page.url.searchParams.get('forfatter') ?? '';

	const updateSearchParams = (key: string, value: string) => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(key, value);
		goto(`?${searchParams.toString()}`);
	};

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Star, ArrowTopRight, Commit, Cross2 } from 'radix-icons-svelte';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { goto } from '$app/navigation';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { Project } from '$lib/types';
	import { derived, writable, type Writable } from 'svelte/store';

	//filters

	const projects: Writable<Project[]> = writable(data.projects);

	// Filter criteria
	let filters = {
		author: 6,
		title: '',
		likes: null
	};

	// Derived store for filtered projects
	const filteredProjects = derived([projects], ([$projects]) =>
		$projects.filter((project) => {
			return (
				!filters.author ||
				/* return all projects where author id is found in project.authors*/
				(project.authors?.some((author) => author.user_id === filters.author) &&
					(!filters.title || project.title.includes(filters.title)) &&
					(filters.likes === null || project.likes >= filters.likes))
			);
		})
	);

	// Function to update filters
	function updateFilter(field, value) {
		filters = { ...filters, [field]: value };
	}
</script>

<main class="px-4">
	<h1 class="text-3xl font-bold">Projekter</h1>
	<Separator class="my-4" />
	<div class="mb-4 flex w-full items-center justify-between">
		<div class="flex w-fit">
			<Input type="search" placeholder="Søg i projekter" class="w-full max-w-lg" />
		</div>
		{#if authorId}
			<div class="flex flex-col gap-1.5">
				<Label for="email">Forfatter</Label>
				<Button
					variant="outline"
					class="flex h-fit items-center gap-4"
					on:click={() => {
						updateSearchParams('forfatter', '');
					}}
				>
					{authorId}
					<Cross2 class="h-4 w-4" />
				</Button>
			</div>
		{/if}
	</div>

	<div class="g grid w-full gap-4">
		{#key authorId}
			{#each $filteredProjects as project}
				<Card.Root class="flex flex-col justify-between">
					<Card.Header>
						<Card.Title>{project.title}</Card.Title>
						<Card.Description>{project.description}</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if project.authors}
							<div id="authors" class="flex w-fit flex-col gap-1">
								{#each project.authors as author}
									<ContextMenu.Root>
										<ContextMenu.Trigger>
											<div class="flex items-center gap-2">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
												>
													{author.user?.firstname[0]}{author.user?.lastname[0]}
												</div>
												<span class="ml-2 font-medium"
													>{author.user?.firstname} {author.user?.lastname}</span
												>
											</div>
										</ContextMenu.Trigger>
										<ContextMenu.Content>
											<p class="m-2 font-medium">
												{author.user?.firstname}
												{author.user?.lastname}
											</p>
											<ContextMenu.Item
												on:click={() => {
													updateSearchParams('forfatter', author.id.toString());
												}}>Find projkter</ContextMenu.Item
											>
										</ContextMenu.Content>
									</ContextMenu.Root>
								{/each}
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="flex  justify-between">
						<div class="flex items-center gap-2">
							<Star class="h-5 w-5 text-secondary-foreground" />
							<span>{project.likes}</span>
						</div>
						<Button href="/projkter/{project.id}">Se mere</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		{/key}
	</div>
</main>

<style>
	.g {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
</style>
