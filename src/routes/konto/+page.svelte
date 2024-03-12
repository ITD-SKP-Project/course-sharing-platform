<script lang="ts">
	import type { PageData } from './$types';

	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';

	$: if (form?.successMessage) {
		toast('Handlingen lykkedes!', {
			description: form.successMessage
		});
	}

	export let data: PageData;

	export let form: any;

	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { AlertTriangle } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Star } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';

	let confirnDelete = '';

	import { enhance } from '$app/forms';
	import { Loader2 } from 'lucide-svelte';
	let loading = false;

	async function deleteAccount() {
		const res = await fetch(`/api/users/delete`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			toast('Din konto er blevet slettet.', {
				description: form.successMessage
			});
			window.location.href = '/';
		} else {
			toast('Der skete en fejl', {
				description: 'Din konto blev ikke slettet.'
			});
		}
	}
</script>

<Toaster />
<main class="flex flex-col px-8 pb-8 pt-2">
	<div class="flex justify-between">
		<h1 class="text-3xl font-bold">Velkommen til din konto, {data.user?.firstname || ''}</h1>
		{#if data.user?.authority_level && data.user.authority_level > 0}
			<Button href="/projekter/ny">Opret nyt projekt</Button>
		{/if}
	</div>

	<Separator class="my-4" />
	<Sheet.Root>
		<Sheet.Trigger asChild let:builder>
			<Button builders={[builder]} class="ml-auto" variant="outline">Bruger info</Button>
		</Sheet.Trigger>
		<Sheet.Content side="right" class="overflow-y-auto">
			<Sheet.Header>
				<Sheet.Title>Administrer din konto</Sheet.Title>
				<Sheet.Description
					>Du kan ændre dine oplysninger her. Tryk "Gem ændringer" når du er færdig.</Sheet.Description
				>
			</Sheet.Header>
			<form
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
				method="POST"
				action="?/updateName"
				class="flex w-full flex-col"
			>
				<h2 class="mt-8 font-semibold">Ret dine oplysninger</h2>
				<div class="mb-4 mt-2 grid gap-4">
					{#key data.user.firstname}
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="firstname" class="text-right">Fornavn</Label>
							<Input
								type="text"
								id="firstname"
								name="firstname"
								value={data.user.firstname}
								class="col-span-3"
							/>
							{#if form?.validationErrors?.firstname}
								<span class="label-text-alt col-span-3 col-start-2 text-red-500"
									>{form?.validationErrors?.firstname[0]}</span
								>
							{/if}
						</div>
					{/key}
					{#key data.user.firstname}
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="lastname" class="text-right">Efternavn</Label>
							<Input id="lastname" name="lastname" value={data.user.lastname} class="col-span-3" />
							{#if form?.validationErrors?.lastname}
								<span class="label-text-alt col-span-3 col-start-2 text-red-500"
									>{form?.validationErrors?.lastname[0]}</span
								>
							{/if}
						</div>
					{/key}
					<Button type="submit" class="!ml-auto">Gem</Button>
				</div>
			</form>

			<form
				method="POST"
				action="?/updatePassword"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
				class="mt-16 flex w-full flex-col"
			>
				<h2 class="mt-8 font-semibold">Skift adgangskode</h2>

				{#key data.user.password}
					<div class="mb-4 mt-2 grid gap-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="password" class="text-right">Nuværende kodeord</Label>
							<Input
								id="password"
								name="previousPassword"
								type="password"
								class="col-span-3"
								placeholder="Tidligere kode"
							/>
							{#if form?.validationErrors?.previousPassword}
								<span class="label-text-alt col-span-3 col-start-2 text-red-500"
									>{form?.validationErrors?.previousPassword[0]}</span
								>
							{/if}
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="new-password" class="text-right">Nyt kodeord</Label>
							<Input
								id="new-password"
								name="password"
								type="password"
								class="col-span-3"
								placeholder="Ny kode"
							/>
							{#if form?.validationErrors?.password}
								<span class="label-text-alt col-span-3 col-start-2 text-red-500"
									>{form?.validationErrors?.password[0]}</span
								>
							{/if}
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="confirm-password" class="text-right">Bekræft kodeord</Label>
							<Input
								name="confirmPassword"
								id="confirm-password"
								type="password"
								class="col-span-3"
								placeholder="Gentag ny kode"
							/>
							{#if form?.validationErrors?.confirmPassword}
								<span class="label-text-alt col-span-3 col-start-2 text-red-500"
									>{form?.validationErrors?.confirmPassword[0]}</span
								>
							{/if}
						</div>
					</div>
				{/key}

				<Button type="submit" class="!ml-auto">Gem</Button>
			</form>
			<div class="mt-16 rounded-xl border border-destructive p-4">
				<div class=" flex items-center gap-4">
					<AlertTriangle class="h-8 w-8 text-destructive" />
					<p class="text-lg">Slet konto</p>
				</div>
				<p class="mt-4 text-muted-foreground">
					Hvis du sletter din konto, vil du ikke kunne gendanne den. Alle dine data vil blive
					slettet permanent.
				</p>
				<AlertDialog.Root>
					<AlertDialog.Trigger asChild let:builder>
						<Button builders={[builder]} variant="destructive" class="mt-4 w-full"
							>Slet konto</Button
						>
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title
								>Er du sikker på du vil slette din konto permanent?</AlertDialog.Title
							>
							<AlertDialog.Description>
								Dette kan ikke fortrydes. Alle dine data vil blive slettet permanent. Alle dine
								projekter vil stadig eksistere men vil ikke være tilknyttet en bruger.
							</AlertDialog.Description>
						</AlertDialog.Header>

						<AlertDialog.Footer class="m-0 w-full p-0">
							<div class="flex w-full flex-col">
								<p>Skriv <strong>Slet min konto</strong> før du kan slette din konto.</p>
								<div class="flex w-48 flex-col gap-2">
									<Input
										class=" w-full border-destructive outline-destructive"
										bind:value={confirnDelete}
									></Input>
									<div class=" mr-auto flex flex-row">
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action asChild let:builder>
											<Button
												disabled={confirnDelete.toLowerCase() != 'slet min konto'}
												builders={[builder]}
												on:click={deleteAccount}
												variant="destructive">Slet forevigt</Button
											>
										</AlertDialog.Action>
									</div>
								</div>
							</div>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</Sheet.Content>
	</Sheet.Root>

	<div class="g grid w-full gap-8">
		{#each data.userProjects as project}
			<Card.Root class="flex flex-col justify-between">
				<Card.Header>
					<div class="flex justify-between">
						<Card.Title>{project.title}</Card.Title>

						<Badge variant="outline" class="text-md mb-4 gap-2">
							<div class="flex items-center gap-2">
								<Star
									class="h-5 w-5 {project.likedByUser ? 'fill-yellow-500 text-yellow-500' : ''}"
								/>
								<span>{project.likes}</span>
							</div>
						</Badge>
					</div>
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
									<Button variant="ghost"
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
										<Button class="h-fit justify-start p-0" variant="ghost"
											><div class="flex items-center gap-2">
												<span class="ml-2 font-medium">{profession.profession_name} </span>
											</div>
										</Button>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</Card.Content>
				<Card.Footer class="justify-end">
					<Button href="/projekter/{project.id}">Se mere</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</main>
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}

<style>
	.g {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
</style>
