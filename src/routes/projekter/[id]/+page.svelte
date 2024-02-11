<script lang="ts">
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;
	export let form;
	$: console.log(form, 'form');
	$: console.log(data, 'data');
	let project = data.project as Project;
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);
	import * as Collapsible from '$lib/components/ui/collapsible';

	import { ChevronDown, ChevronUp, Loader2, Star } from 'lucide-svelte';

	import * as Card from '$lib/components/ui/card';

	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import { Heart, BadgeInfo } from 'lucide-svelte';

	import { months } from '$lib/index';
	import { Button } from '$lib/components/ui/button';

	import DowdloadLink from '$lib/components/DowdloadLink.svelte';

	let loadingLike = false;
	const likeProject = async () => {
		loadingLike = true;
		const response = await fetch(`/api/projects/${project.id}/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		loadingLike = false;

		if (response.ok) {
			const data = await response.json();
			console.log('🚀 ~ likeProject ~ data:', data);
			project.likedByUser = data.liked;
			project.likes = data.likes ?? 0;
		}
	};

	const formatter = new Intl.NumberFormat('da-DK', {
		notation: 'compact'
	});
</script>

<main class="flex flex-col gap-4 p-2 sm:p-8 lg:px-32">
	<div class="relative flex flex-wrap justify-between gap-4">
		<div>
			<div class="mb-8 flex items-center gap-2">
				{#key project.likedByUser && project.likes}
					<Button on:click={likeProject} variant="ghost" size="icon" class="text-md gap-2">
						{#if loadingLike}
							<Loader2 class="h-5 w-5 animate-spin" />
						{:else}
							<Star
								class="h-5 w-5 {project.likedByUser ? 'fill-yellow-500 text-yellow-500' : ''}"
							/>
						{/if}
					</Button>
				{/key}
				<strong class="text-3xl">
					{formatter.format(project.likes)}
				</strong>
			</div>
			<h1 class="mb-8 text-4xl font-semibold">{project.title}</h1>
			<p class="text max-w-[40rem] font-light leading-7">
				{project.description} Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos expedita
				earum a dolorum corrupti cupiditate commodi facilis similique voluptates nihil corporis laborum
				officiis reprehenderit id labore neque pariatur sint voluptatem molestias quis magni asperiores,
				reiciendis dolor! Laudantium, aspernatur tenetur? Deleniti exercitationem iste incidunt sit non,
				numquam itaque qui quod suscipit quasi veniam sint deserunt distinctio earum necessitatibus,
				facilis officiis assumenda dolores. Porro quo voluptatem corrupti vero commodi provident ipsum
				optio eaque natus perspiciatis et perferendis, ea iure ad ullam doloremque sapiente odio! Necessitatibus
				animi illum numquam aut, nam quisquam labore nihil placeat sint. Perspiciatis quibusdam, nobis
				obcaecati illo expedita in.
			</p>
			{#if project.notes}
				<h2 class="mb-2 mt-16 text-xl font-bold">Underviser Notater</h2>
				<Alert.Root class=" w-fit ">
					<BadgeInfo class="h-4 w-4" />
					<Alert.Title>Note til vejledere.</Alert.Title>
					<Alert.Description class="max-w-[40rem]">{project.notes}</Alert.Description>
				</Alert.Root>
			{/if}
			{#if project.professions && project.professions.length > 0}
				<div class="mt-16">
					<h2 class="mb-1 text-xl font-bold">Uddannelser</h2>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Udd.</Table.Head>
								<Table.Head>Niveau</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each project.professions as profession}
								<Table.Row>
									<Table.Cell>{profession.profession_name}</Table.Cell>
									<Table.Cell>{profession.skill_level}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}

			{#if project.subjects}
				<Collapsible.Root class="mb-2 mt-16 w-fit min-w-52">
					<div class="flex items-center justify-between space-x-4">
						<h2 class="mb-1 text-xl font-bold">Fagområder</h2>
						{#if project.subjects.split('[ENTER]').length > 1}
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
						{project.subjects.split('[ENTER]')[0]}
					</div>
					<Collapsible.Content class="space-y-2">
						{#each project.subjects.split('[ENTER]').splice(1) as resource}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">{resource}</div>
						{/each}
					</Collapsible.Content>
				</Collapsible.Root>
			{/if}

			{#if project.resources}
				<Collapsible.Root class="max-w-1/2 mb-2 mt-8 w-fit min-w-52">
					<div class="flex items-center justify-between space-x-4">
						<h2 class="mb-1 text-xl font-bold">Ressourcer</h2>
						{#if project.resources.split('[ENTER]').length > 1}
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
						{project.resources.split('[ENTER]')[0]}
					</div>
					<Collapsible.Content class="space-y-2">
						{#each project.resources.split('[ENTER]').splice(1) as resource}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">{resource}</div>
						{/each}
					</Collapsible.Content>
				</Collapsible.Root>
			{/if}
		</div>

		<!-- ? infobox -->
		<Card.Root class="sticky top-24 h-fit min-w-72 border-primary">
			<Card.Header class="pb-4">
				{#if project?.authors?.some((author) => author.user_id === data.user?.id)}
					<Button class="mb-2" size="lg">Rediger projekt</Button>
				{/if}
				<Card.Title>Info</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">Oprettet</span>
						<span class="text-sm"
							>{created_at.getDay()}.
							{months[created_at.getMonth()]}
							{created_at.getFullYear()}</span
						>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">Senest opdateret</span>
						<span class="text-sm"
							>{updated_at.getDay()}.
							{months[updated_at.getMonth()]}
							{updated_at.getFullYear()}</span
						>
					</div>
				</div>
			</Card.Content>
			<Card.Header class="pb-4">
				<Card.Title class="flex items-center gap-2">Forfattere</Card.Title>
			</Card.Header>
			<Card.Content>
				<span class="text-sm text-muted-foreground">Dette project er lavet af</span>
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
											class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
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

			<Card.Header class="pb-4">
				<Card.Title>Projekt links</Card.Title>
			</Card.Header>
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
