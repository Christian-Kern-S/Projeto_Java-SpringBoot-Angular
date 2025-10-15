package com.internews.gestao_clientes.repositories;

import com.internews.gestao_clientes.models.ChatConversationModel;
import com.internews.gestao_clientes.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;


public interface ChatConversationRepository extends JpaRepository<ChatConversationModel, UUID> {

  @Query("""
    select distinct c
    from ChatConversationModel c
    left join fetch c.participants participants
    left join fetch participants.user
    where c.id in (
      select c2.id
      from ChatConversationModel c2
      join c2.participants p2
      where p2.user = :user
    )
    order by c.updatedAt desc
  """)
  List<ChatConversationModel> findAllByParticipant(UsuarioModel user);

    @Query("""
        select c
        from ChatConversationModel c
        join c.participants p1
        join c.participants p2
        where c.groupChat = false
          and p1.user = :userA
          and p2.user = :userB
    """)
    ChatConversationModel findDirectConversation(UsuarioModel userA, UsuarioModel userB);
}
