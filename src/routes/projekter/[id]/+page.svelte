<script lang="ts">
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;
	console.log('🚀 ~ data:', data);

	import * as Card from '$lib/components/ui/card';

	const project = data.project as Project;
</script>

<main class="flex flex-col gap-4 p-2 sm:p-8">
	<div class="flex justify-between">
		<div>
			<h1 class="text-4xl font-semibold">{project.title}</h1>
			<p class="text">{project.description}</p>
		</div>
		<Card.Root>
			<Card.Header>
				<Card.Title>Forfattere</Card.Title>
				<Card.Description>Dette project er lavet af</Card.Description>
			</Card.Header>
			<Card.Content>
				<div
					id="authors"
					class="p.2 mt-2 flex w-full flex-col flex-wrap gap-x-8 gap-y-4 rounded-md bg-secondary p-2"
				>
					{#if project.authors && project.authors.length > 0}
						{#each project.authors as author}
							{#if author?.user}
								<div class="flex items-center gap-2">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
									>
										{author.user.firstname ? author.user.firstname[0] : ''}
										{author.user.lastname ? author.user.lastname[0] : ''}
									</div>
									<span class="ml-2 font-medium"
										>{author.user.firstname}
										{author.user.lastname}
									</span>
								</div>
								<span class="ml-2 font-medium"
									>{author.user?.firstname}
									{author.user?.lastname}
								</span>
							{/if}
						{/each}
					{/if}
				</div>
			</Card.Content>
			<Card.Header>
				<Card.Title>Forfattere</Card.Title>
				<Card.Description>Dette project er lavet af</Card.Description>
			</Card.Header>
		</Card.Root>
	</div>
</main>
