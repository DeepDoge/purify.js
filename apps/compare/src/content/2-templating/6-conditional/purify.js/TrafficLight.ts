import { fragment, ref, tags } from "@purifyjs/core";

const { button, p, span } = tags;

const TRAFFIC_LIGHTS = ["red", "orange", "green"] as const;
export function TrafficsLight() {
	const lightIndex = ref(0);

	const light = lightIndex.derive(
		(lightIndex) => TRAFFIC_LIGHTS[lightIndex],
	);

	function nextLight() {
		lightIndex.val =
			(lightIndex.val + 1) % TRAFFIC_LIGHTS.length;
	}

	return fragment(
		button()
			.onclick(nextLight)
			.textContent("Next light"),
		p().children("Light is: ", light),
		p().children(
			"You must",
			light.derive((light) => {
				if (light === "red") {
					return span().textContent("STOP");
				} else if (light === "orange") {
					return span().textContent("SLOW DOWN");
				} else if (light === "green") {
					return span().textContent("GO");
				}
				light satisfies never;
				throw new Error(
					`Unhandled light: ${light}`,
				);
			}),
		),
	);
}
