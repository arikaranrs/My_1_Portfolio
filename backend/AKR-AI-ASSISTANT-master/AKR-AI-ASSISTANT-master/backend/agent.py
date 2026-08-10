from dotenv import load_dotenv
import os
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import google, noise_cancellation
from prompt import AGENT_INSTRUCTIONS, AGENT_RESPONSES

load_dotenv()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTIONS)

async def entrypoint(ctx: agents.JobContext):
    """
    Main entry point for the KIRA voice agent.
    This function sets up the LiveKit session with Google's Gemini model
    and configures voice settings and noise cancellation.
    """
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",
            voice="Puck",
            temperature=0.8,
            instructions=AGENT_INSTRUCTIONS,
        )
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions=AGENT_RESPONSES
    )

if __name__ == "__main__":
    print("🤖 KIRA Agent is running...")
    print("🎙️  Voice Assistant Ready")
    print("🌐 Multi-language Support Active")
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
