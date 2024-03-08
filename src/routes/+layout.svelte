<script lang="ts">
	import '../app.pcss';

	import type { LayoutData } from './$types';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { HamburgerMenu, Person, MagnifyingGlass, Home } from 'radix-icons-svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { onMount } from 'svelte';
	import { user } from '$lib/index';
	import Footer from '$lib/components/Footer.svelte';

	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import { gsap } from 'gsap/dist/gsap';
	import Flip from 'gsap/dist/Flip';
	import { page } from '$app/stores';
	$: console.log('🚀 ~ file: %2Blayout.svelte ~ line 31 ~ page', $page);
	let state: any;

	gsap.registerPlugin(Flip);

	beforeNavigate(() => {
		state = Flip.getState('#theme-image, #login-form');
	});

	afterNavigate(() => {
		if (state) {
			Flip.from(state, {
				duration: 0.5,
				ease: 'easeInOut',
				scale: false,
				targets: '#theme-image, #login-form',
				simple: true
			});
		}
	});

	export let data: LayoutData;
	console.log('🚀 ~ data:', data);
	let darkMode = data.darkmode;
	let color: string = data.color ?? '';
	user.set(data.user);

	let loaded = false;
	onMount(() => {
		loaded = true;
		setTheme();
	});
	function setTheme() {
		if (darkMode) {
			document.documentElement.id = 'dark';
		} else {
			document.documentElement.id = 'light';
		}
		if (color && loaded) {
			document.documentElement.setAttribute('theme', color);
			color = color;
		}
	}

	let open = false;
</script>

<nav class="sticky top-0 z-50 flex justify-between bg-background px-4 py-2">
	<div class="flex gap-4">
		<Sheet.Root bind:open>
			<Sheet.Trigger asChild let:builder>
				<Button
					aria-label="Åben Sidebar knap"
					class="relative"
					size="icon"
					builders={[builder]}
					variant="outline"
				>
					<HamburgerMenu class="h-[1.2rem] w-[1.2rem]" />
					{#if data.notificationCount > 0 && $page.route.id != '/admin/brugere'}
						<div
							class="absolute -bottom-2 -right-2 flex aspect-square h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
						>
							{data.notificationCount}
						</div>
					{/if}
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left">
				<Sheet.Header>
					<Sheet.Title>Find det du leder efter...</Sheet.Title>
					<Sheet.Description class="flex flex-col gap-2">
						<Button
							variant="outline"
							href="/"
							on:click={() => {
								open = false;
							}}>Forside</Button
						>
						<Button
							on:click={() => {
								open = false;
							}}
							variant="outline"
							href="/konto">Din konto</Button
						>
						{#if (data.user?.authority_level && data.user?.authority_level >= 3) || ($user?.authority_level && $user?.authority_level >= 3)}
							<Button
								on:click={() => {
									open = false;
								}}
								variant="outline"
								class="relative"
								href="/admin/brugere"
							>
								Administrer brugere
								{#if data.notificationCount > 0}
									<div
										class="absolute -bottom-2 -right-2 flex aspect-square h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
									>
										{data.notificationCount}
									</div>
								{/if}
							</Button>
						{/if}
					</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
		<div class="flex gap-2">
			<Tooltip.Root>
				<Tooltip.Trigger tabindex={-1}>
					<Button aria-label="Link til hjem siden" variant="secondary" size="icon" href="/">
						<Home class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Hjem</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>

	<div class="flex gap-2">
		<ThemeToggle {darkMode} {loaded} {color} />
		{#if $user}
			<Button
				aria-label="Skift farve tema"
				variant="secondary"
				class="justify-center2 flex items-center gap-2 px-4 pl-2"
				on:click={async () => {
					await fetch('/api/signout', { method: 'DELETE' });
					user.set(null);
					location.reload();
				}}
			>
				<Person class="h-[1.2rem] w-[1.2rem]" />
				Log ud
			</Button>
		{:else}
			<Button
				variant="secondary"
				class="justify-center2 flex items-center gap-2 px-4 pl-2"
				href="/login"
			>
				<Person class="h-[1.2rem] w-[1.2rem]" />
				Login
			</Button>
		{/if}
	</div>
</nav>
<slot />
<Footer />
<Toaster />
