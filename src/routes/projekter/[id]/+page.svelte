<script lang="ts">
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;
	export let form;
	$: console.log(form, 'form');
	$: console.log(data, 'data');
	const project = data.project as Project;
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);

	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import { Heart, BadgeInfo, UserRoundPlus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { months } from '$lib/index';
	import { Button } from '$lib/components/ui/button';
	import UserSelector from '$lib/components/userSelector.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import Input from '$lib/components/ui/input/input.svelte';
</script>

<main class="flex flex-col gap-4 p-2 sm:p-8 lg:px-32">
	<div class="relative flex flex-wrap justify-between gap-4">
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
				<div class="mt-16">
					<h2 class="mb-1 text-xl font-bold">Fag som indrages i projektet</h2>

					<Input
						type="text"
						disabled={true}
						class="w-fit hover:cursor-default disabled:cursor-default disabled:opacity-100 disabled:hover:cursor-default"
						value={project.subjects}
					/>
				</div>
			{/if}
			{#if project.resources}
				<div class="mt-16">
					<h2 class="mb-1 text-xl font-bold">Nødvendig recurser</h2>

					<Input
						type="text"
						disabled={true}
						class="w-fit hover:cursor-default disabled:cursor-default disabled:opacity-100 disabled:hover:cursor-default"
						value={project.resources}
					/>
				</div>
			{/if}
		</div>

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
				<Card.Title class="flex items-center gap-2">
					Forfattere <form method="POST" action="?/getUsers">
						<Tooltip.Root>
							<Tooltip.Trigger asChild let:builder>
								<Button builders={[builder]} type="submit" size="icon" variant="ghost">
									<input type="text" value="users" class="absolute hidden" />
									<UserRoundPlus class="h-4 w-4" />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Tilføj medforfattere til dette projekt</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</form>
				</Card.Title>
				{#if form?.users}
					<Dialog.Root open={true}>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Tilføj forfattere til dette projekt</Dialog.Title>
								<Dialog.Description>
									<UserSelector users={form?.users} />
								</Dialog.Description>
							</Dialog.Header>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
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
			{#if project.notes}
				<Card.Header class="pb-4">
					<Card.Title>Noter</Card.Title>
				</Card.Header>
				<Card.Content>
					<Alert.Root class=" w-fit ">
						<BadgeInfo class="h-4 w-4" />
						<Alert.Title>Note til vejledere.</Alert.Title>
						<Alert.Description class="max-w-72">{project.notes}</Alert.Description>
					</Alert.Root>
				</Card.Content>
			{/if}
			<Card.Header class="pb-4">
				<Card.Title>Projekt links</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if project.files}
					{#each project.files as file}
						<a download={file.pathname} href={'/src/files/' + file.pathname}>{file.filename}</a>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
