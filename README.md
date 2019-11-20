# NodeProject

## Analyse


**Sujet :** Le Juste Prix


**Problème :** Réaliser un Juste Prix multijoueurs en ligne

Le but du jeu est de deviner le prix de divers biens de consommation dont la photo s’affiche à l’écran. Lors de chaque manche, les joueurs doivent saisir un prix à l’abri des regards. Le joueur le plus proche du prix de l’objet correspondant remporte la manche. La partie se termine lorsque toutes les manches sont achevées.


**Sous-problème 1 : Gestion du score**

La gestion du score est primordiale pour ce jeu, participant au divertissement des participants.<br />
Il faudra prévoir la rémunération en points de chaque manche pour chaque joueur.<br />
En cas de prix saisi égaux comment sont gérés les points ?


**Sous-problème 2 : Gestion des salles d’attente**

Sur les autres plateformes de jeu en ligne disponibles, il nous est arrivé de vouloir directement relancer une partie entre les joueurs déjà présents dans la salle d’attente.<br />
Malheureusement, cette option n’était que rarement implémentée et il nous est demandé de recréer une partie à chaque fois.
Il est rare que des options des filtrage soient fournies au joueur qui crée une partie (nombre de manches, nombre de joueurs, type de manches...).<br />
A partir du moment où le lien est envoyé, n’importe qui peut rejoindre, ce qui peut causer problème.<br />
Également, une partie avec trop de manches deviendrait sans doute ennuyeuse et une partie avec peu de manches ne serait pas assez exaltante.


**Sous-problème 3 : Gestion des manches / parties**

Il doit être intéressant et divertissant pour les joueurs de jouer au jeu ensemble, il faut donc élaborer un système de parties d’une durée idéale pour n’être ni trop courtes, ni trop longues, et permettant de donner à chacun de pouvoir avoir ses chances en pouvant revenir dans le classement même si le résultat d’une manche a été faible. Il faut également suffisamment d’étapes pour que le classement final représente bien la réussite de chaque joueur, de façon à ce qu’un joueur qui a de la chance une fois ne monopolise pas forcément le haut du classement.


**Sous-problème 4 : Déconnexion intempestive d’un joueur**

Si un joueur se déconnecte, il ne doit pas pouvoir bloquer une partie en cours et sa déconnexion doit pouvoir être détectée.


**Sous-problème 5 : Créer/Rejoindre une partie**

Avoir la possibilité de créer une partie, permettre à d’autres de la rejoindre, lancer une partie.




## Conception

**Solution au sous-problème 1 : Gestion du score**

* 5 points pour le plus proche (x2 si prix exact)
* 3 points pour le second
* 1 point pour le troisième
En cas de prix égaux, le classement se fera au premier qui valide, la meilleure place.


**Solution au sous-problème 2 : Gestion des salles d’attente**

Afin d’apporter une meilleure expérience utilisateur, nous souhaitons leur permettre d’avoir le contrôle total de la salle d’attente que l’un d’eux aura créé.<br />
Les joueurs présents dans une salle auront tous l’option à la fin de la partie de relancer directement la même salle d’attente avec les mêmes joueurs.<br />
Un menu sera donc disponible à côté de la liste des joueurs déjà présents afin de permettre à l’hôte de réduire le nombre de joueurs (pas plus que le nombre de joueurs déjà présents ou 2 s’il est seul), d’ajouter des emplacements pour de nouveaux joueurs (jusqu’à une certaine limite) et de changer le nombre de manches.


**Solution au sous-problème 3 : Gestion des manches / parties**

Afin que les joueurs puissent avoir le déroulement du jeu qui leur est idéal, nous donnerons à l’utilisateur qui crée la partie le choix du nombre de manches qu’il souhaite avoir dans sa partie. Un nombre de manches par défaut idéal sera prédéfini.<br />
Le créateur de la partie peut aussi choisir le temps donné dans chaque manche aux joueurs pour deviner le prix de l’objet.
Une fois la partie démarrée, les manches définies se déroulent, en affichant un classement provisoire à la fin de chacune d’elles, puis le classement final une fois toutes les manches effectuées.<br />
Dans chaque manche, un objet est affiché à tous les joueurs, et ceux-ci doivent proposer son prix dans le temps imparti.


**Solution au sous-problème 4 : Déconnexion intempestive d’un joueur**

Evénement onbeforeunload / socket.io ?


**Solution au sous-problème 5 : Créer/Rejoindre une partie**

La solution retenue est de proposer deux boutons sur la page d’accueil, un bouton ‘Créer une partie’ et un bouton ‘Rejoindre une partie’. Le premier redirigera vers une page ‘salle d’attente’, le second demandera de saisir un code de partie à rejoindre.



## Feuille de route
**Sprint 1 (début décembre) :**
*	Pouvoir débuter une partie avec un nombre de joueurs fixe
*	Sélection aléatoire de produits dont il faut deviner le prix généré à l’aide d’une API
*	Implémenter le bon déroulement d’une partie
*	Classement de fin d’une manche

**Sprint 2 (fin décembre) :**
*	Gestion des scores sur plusieurs parties
*	Page d’inscription / connexion + gestion de la session
*	Gestion des salles d’attente (réglages + invitations)

**Sprint 3 (janvier) :**
*	Classement général de tous les joueurs
*	Design avancé
*	Mise en relation automatique des joueurs



## Prototype initial

Le prototype qui servira de “proof of concept” doit permettre à plusieurs joueurs d’essayer le jeu en déroulant des parties complètes. Certains utilisateurs doivent pouvoir créer des parties avec les paramètres qu’ils souhaitent, et d’autres doivent pouvoir les rejoindre. Tous les joueurs doivent pouvoir s’inscrire ou se connecter avant de rejoindre une partie.<br />
Une fois la partie lancée, celle-ci doit se dérouler automatiquement selon les paramètres de temps définis au préalable, de manière fluide et agréable pour les utilisateurs. Les classements doivent être corrects et l’attribution des points bien équilibrée.<br />
Après avoir correctement déroulé une partie, l’option pour en relancer une autre doit être clairement visible et disponible pour chaque utilisateur.

Scénario : 
![Scénario](https://i.imgur.com/MGGd0qE.png)
