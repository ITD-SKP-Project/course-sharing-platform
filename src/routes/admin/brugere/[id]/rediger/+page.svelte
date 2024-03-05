<script lang="ts">
	import type { PageData } from './$types';
	//page store
	import { page } from '$app/stores';
	import { Label } from '$lib/components/ui/label';

	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';

	export let data: PageData;

	let loading = false;

	const id = $page.params.id;
	const user = data.userToEdit;
	const currentUser = data.user;
	export let form;
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<div class="mx-auto">
		<h1 class="text-4xl font-semibold">Opdater bruger oplysninger for {user.firstname}</h1>
		<p class="text mt-2">Udfyld alle felterne og tryk på opdater.</p>

		{#key form}
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
				class="mt-8 flex w-full max-w-lg flex-col gap-12"
				enctype="multipart/form-data"
			>
				<div>
					<div class="grid w-full max-w-sm items-center gap-1.5">
						<Label for="firstname">Fornavn</Label>
						<Input
							required={true}
							name="firstname"
							type="firstname"
							id="firstname"
							placeholder={user.firstname}
							value={form?.formData?.firstname ?? user.firstname}
							class="text-foreground"
						/>
					</div>
					{#if form?.validationErrors?.firstname}
						<p class="text-sm text-red-500">
							{form.validationErrors.firstname[0]}
						</p>
					{/if}
				</div>
				<div>
					<div class="grid w-full max-w-sm items-center gap-1.5">
						<Label for="lastname">Efternavn</Label>
						<Input
							required={true}
							name="lastname"
							type="lastname"
							id="lastname"
							placeholder={user.lastname}
							value={form?.formData?.lastname ?? user.lastname}
							class="text-foreground"
						/>
					</div>
					{#if form?.validationErrors?.lastname}
						<p class="text-sm text-red-500">
							{form.validationErrors.lastname[0]}
						</p>
					{/if}
				</div>
				<div>
					<div class="flex w-full flex-col gap-1.5">
						<Label for="terms">Rettighedsnivau</Label>
						<div>
							<input
								required={true}
								checked={form?.formData?.authority_level == 1 || user.authority_level == 1}
								type="radio"
								name="authority_level"
								value="1"
							/>
							<Label for="authority_level">Bruger</Label>
						</div>
						<div>
							<input
								required={true}
								type="radio"
								name="authority_level"
								value="2"
								checked={form?.formData?.authority_level == 2 || user.authority_level == 2}
							/>
							<Label for="authority_level">Projekt Moderator</Label>
						</div>
						{#if currentUser.authority_level && currentUser.authority_level > 3}
							<div>
								<input
									required={true}
									type="radio"
									name="authority_level"
									value="3"
									checked={form?.formData?.authority_level == 4 || user.authority_level == 3}
								/>
								<Label for="authority_level">Bruger Moderator</Label>
							</div>
						{/if}
						{#if currentUser.authority_level && currentUser.authority_level > 4}
							<div>
								<input
									required={true}
									type="radio"
									name="authority_level"
									value="4"
									checked={form?.formData?.authority_level == 4 || user.authority_level == 4}
								/>
								<Label for="authority_level">Administrator</Label>
							</div>
						{/if}
					</div>
					{#if form?.validationErrors?.authority_level}
						<p class="text-sm text-red-500">
							{form.validationErrors.authority_level[0]}
						</p>
					{/if}
				</div>
				<Button type="submit">Opdater</Button>
			</form>
		{/key}
	</div>
</main>
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
