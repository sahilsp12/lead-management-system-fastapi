from sqlalchemy.orm import Session
from app.models.user import User
from app.models.lead import Lead


def get_next_agent_for_assignment(db: Session) -> int | None:
    """Determine the next Agent ID to assign a lead using the Round Robin algorithm."""
    # 1. Fetch all active agents in a stable order (by ID)
    agents = db.query(User).filter(User.role == "Agent").order_by(User.id).all()
    if not agents:
        return None

    # 2. Find the last lead that was assigned to an agent
    last_assigned_lead = (
        db.query(Lead)
        .filter(Lead.assigned_to.isnot(None))
        .order_by(Lead.id.desc())
        .first()
    )

    if not last_assigned_lead:
        # No prior assignments exist; assign to the first agent
        return agents[0].id

    # 3. Locate the last assigned agent's position in our agents list
    last_agent_id = last_assigned_lead.assigned_to
    last_agent_index = -1
    for idx, agent in enumerate(agents):
        if agent.id == last_agent_id:
            last_agent_index = idx
            break

    if last_agent_index == -1:
        # The previously assigned agent was likely deleted; default to the first agent
        return agents[0].id

    # 4. Calculate the next agent's index in the round robin rotation
    next_agent_index = (last_agent_index + 1) % len(agents)
    return agents[next_agent_index].id
