<script lang="ts">
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;

	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert';
	import { Heart, BadgeInfo } from 'lucide-svelte';

	const project = data.project as Project;

	import { months } from '$lib/index';
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);
</script>

<main class="flex flex-col gap-4 p-2 sm:p-8 lg:px-32">
	<div class="flex flex-wrap justify-between gap-4">
		<div>
			{#if project.likes > 0}
				<Badge variant="secondary" class="text-md mb-4 gap-2">
					<Heart class="h-4 w-4" />
					{project.likes}
				</Badge>
			{/if}
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
		</div>

		<Card.Root class="min-w-72">
			<Card.Header class="pb-4">
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
				<Card.Title>Forfattere</Card.Title>
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
				<Card.Title>Noter</Card.Title>
			</Card.Header>
			<Card.Content>
				<Alert.Root class=" w-fit border-primary">
					<BadgeInfo class="h-4 w-4" />
					<Alert.Title>Note til vejledere.</Alert.Title>
					<Alert.Description class="max-w-72"
						>You can add components to your app using the cli.</Alert.Description
					>
				</Alert.Root>
			</Card.Content>
		</Card.Root>
	</div>
</main>
