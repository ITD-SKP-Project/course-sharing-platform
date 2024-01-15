<script lang="ts">
	import { Sun, Moon, BlendingMode } from 'radix-icons-svelte';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';
	let darkmode = true;
	let loaded = false;
	let color = 'blue';

	onMount(() => {
		loaded = true;
		const theme = localStorage.getItem('theme');
		const colorTheme = localStorage.getItem('color');

		if (theme === 'light') {
			document.documentElement.id = 'light';
			darkmode = false;
		} else {
			document.documentElement.id = 'dark';
			darkmode = true;
		}

		if (colorTheme) {
			document.documentElement.setAttribute('theme', colorTheme);
			color = colorTheme;
		}
	});
	function changeColor(color_: string) {
		if (!loaded) return;
		document.documentElement.setAttribute('theme', color_);
		localStorage.setItem('color', color_);
		color = color_;
	}
	$: changeColor(color);
	function toggle() {
		if (!loaded) return;
		if (darkmode) {
			document.documentElement.id = 'light';
			localStorage.setItem('theme', 'light');
		} else {
			document.documentElement.id = 'dark';
			localStorage.setItem('theme', 'dark');
		}
		darkmode = !darkmode;
	}
	$: console.log(darkmode);
	$: console.log(color);
</script>

<div class="flex gap-2">
	<Tooltip.Root>
		<Tooltip.Trigger tabindex={-1}>
			<Button variant="outline" size="icon" on:click={toggle}>
				{#if darkmode}
					<Moon class="h-[1.2rem] w-[1.2rem]" />
				{:else}
					<Sun class="h-[1.2rem] w-[1.2rem]" />
				{/if}
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Skift mellem lys og mørk tilstand</p>
		</Tooltip.Content>
	</Tooltip.Root>

	<Tooltip.Root>
		<Tooltip.Trigger tabindex={-1}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button size="icon" variant="outline" builders={[builder]}>
						<BlendingMode class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Tema farve</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.RadioGroup bind:value={color} class="flex flex-col gap-1 ">
						<DropdownMenu.RadioItem class="flex gap-2" value="blue">
							<div class="blue aspect-square h-5 w-5 rounded-full" />
							Blue</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="purple">
							<div class="purple aspect-square h-5 w-5 rounded-full" />
							Purple</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="green">
							<div class="green aspect-square h-5 w-5 rounded-full" />
							Green</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="yellow">
							<div class="yellow aspect-square h-5 w-5 rounded-full" />
							Yellow</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="orange">
							<div class="orange aspect-square h-5 w-5 rounded-full" />
							Orange</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="red">
							<div class="red aspect-square h-5 w-5 rounded-full" />
							Red</DropdownMenu.RadioItem
						>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Skift farvetema</p>
		</Tooltip.Content>
	</Tooltip.Root>
</div>

<style>
</style>
