from sqlalchemy.orm import Session

from app.models.user import User

from app.models.lead import Lead

def get_next_agent_for_assignment(db: Session) -> int | None:

    """Determine the next Agent ID to assign a lead using the Round Robin algorithm."""

    agents = db.query(User).filter(User.role == "Agent").order_by(User.id).all()

    if not agents:

        return None

    last_assigned_lead = (

        db.query(Lead)

        .filter(Lead.assigned_to.isnot(None))

        .order_by(Lead.id.desc())

        .first()

    )

    if not last_assigned_lead:

        return agents[0].id

    last_agent_id = last_assigned_lead.assigned_to

    last_agent_index = -1

    for idx, agent in enumerate(agents):

        if agent.id == last_agent_id:

            last_agent_index = idx

            break

    if last_agent_index == -1:

        return agents[0].id

    next_agent_index = (last_agent_index + 1) % len(agents)

    return agents[next_agent_index].id

