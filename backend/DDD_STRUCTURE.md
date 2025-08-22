# Domain-Driven Design (DDD) Structure - NovaChat Enterprise Edition

## 🎯 **Tổng quan**

NovaChat được cấu trúc theo **Domain-Driven Design (DDD)** để tạo ra một kiến trúc enterprise-grade, dễ bảo trì và mở rộng.

## 🏗️ **Cấu trúc thư mục**

```
app/
├── Domain/                    # Domain Layer (Core Business Logic)
│   ├── User/                 # User Domain
│   │   ├── Entities/         # User-related entities
│   │   ├── Repositories/     # User data access interfaces
│   │   ├── Services/         # User business logic
│   │   ├── Events/           # User domain events
│   │   ├── Listeners/        # User event listeners
│   │   ├── Exceptions/       # User domain exceptions
│   │   └── ValueObjects/     # User value objects
│   ├── Team/                 # Team Domain
│   ├── Channel/              # Channel Domain
│   ├── Message/              # Message Domain
│   ├── File/                 # File Domain
│   ├── Call/                 # Voice/Video Call Domain
│   ├── Notification/         # Notification Domain
│   ├── Analytics/            # Analytics Domain
│   ├── Integration/          # Integration Domain
│   └── Security/             # Security Domain
├── Application/              # Application Layer (Use Cases)
│   ├── Services/             # Application services
│   ├── Commands/             # Command handlers
│   ├── Queries/              # Query handlers
│   ├── DTOs/                 # Data Transfer Objects
│   └── Interfaces/           # Application interfaces
├── Infrastructure/           # Infrastructure Layer (External Concerns)
│   ├── Database/             # Database implementations
│   ├── Repositories/         # Repository implementations
│   ├── External/             # External service integrations
│   ├── Events/               # Event implementations
│   ├── Queue/                # Queue implementations
│   ├── Storage/              # File storage implementations
│   └── Cache/                # Cache implementations
└── Shared/                   # Shared Kernel
    ├── Events/               # Shared events
    ├── Exceptions/           # Shared exceptions
    ├── Interfaces/           # Shared interfaces
    ├── Traits/               # Shared traits
    ├── Helpers/              # Shared helpers
    └── Constants/            # Shared constants
```

## 🎯 **Domain Layer (Core Business Logic)**

### **1. User Domain**
```
Domain/User/
├── Entities/
│   ├── User.php              # User entity
│   ├── UserStatus.php        # User status entity
│   ├── UserSession.php       # User session entity
│   └── UserPreference.php    # User preference entity
├── Repositories/
│   └── UserRepositoryInterface.php
├── Services/
│   ├── UserService.php       # User business logic
│   ├── AuthenticationService.php
│   └── UserProfileService.php
├── Events/
│   ├── UserRegistered.php
│   ├── UserLoggedIn.php
│   └── UserProfileUpdated.php
└── ValueObjects/
    ├── Email.php
    ├── Username.php
    └── Password.php
```

### **2. Team Domain**
```
Domain/Team/
├── Entities/
│   ├── Team.php              # Team entity
│   ├── TeamMember.php        # Team member entity
│   └── Invitation.php        # Team invitation entity
├── Services/
│   ├── TeamService.php       # Team business logic
│   ├── TeamMemberService.php
│   └── InvitationService.php
└── Events/
    ├── TeamCreated.php
    ├── MemberJoined.php
    └── InvitationSent.php
```

### **3. Channel Domain**
```
Domain/Channel/
├── Entities/
│   ├── Channel.php           # Channel entity
│   └── ChannelMember.php     # Channel member entity
├── Services/
│   ├── ChannelService.php    # Channel business logic
│   └── ChannelMemberService.php
└── Events/
    ├── ChannelCreated.php
    ├── MemberAdded.php
    └── ChannelArchived.php
```

### **4. Message Domain**
```
Domain/Message/
├── Entities/
│   ├── Message.php           # Message entity
│   ├── MessageReaction.php   # Message reaction entity
│   ├── MessageAttachment.php # Message attachment entity
│   ├── MessageEdit.php       # Message edit history
│   ├── DirectMessage.php     # Direct message entity
│   └── Mention.php           # Mention entity
├── Services/
│   ├── MessageService.php    # Message business logic
│   ├── ReactionService.php
│   └── MentionService.php
└── Events/
    ├── MessageSent.php
    ├── MessageEdited.php
    └── ReactionAdded.php
```

### **5. File Domain**
```
Domain/File/
├── Entities/
│   ├── File.php              # File entity
│   ├── FileShare.php         # File share entity
│   └── FilePermission.php    # File permission entity
├── Services/
│   ├── FileService.php       # File business logic
│   └── FilePermissionService.php
└── Events/
    ├── FileUploaded.php
    ├── FileShared.php
    └── PermissionGranted.php
```

### **6. Call Domain**
```
Domain/Call/
├── Entities/
│   ├── VoiceCall.php         # Voice call entity
│   └── CallParticipant.php   # Call participant entity
├── Services/
│   └── CallService.php       # Call business logic
└── Events/
    ├── CallStarted.php
    ├── CallEnded.php
    └── ParticipantJoined.php
```

### **7. Notification Domain**
```
Domain/Notification/
├── Entities/
│   └── Notification.php      # Notification entity
├── Services/
│   └── NotificationService.php
└── Events/
    ├── NotificationSent.php
    └── NotificationRead.php
```

### **8. Analytics Domain**
```
Domain/Analytics/
├── Entities/
│   ├── AnalyticsEvent.php    # Analytics event entity
│   └── TeamAnalytics.php     # Team analytics entity
├── Services/
│   └── AnalyticsService.php  # Analytics business logic
└── Events/
    ├── EventTracked.php
    └── AnalyticsGenerated.php
```

### **9. Integration Domain**
```
Domain/Integration/
├── Entities/
│   ├── Webhook.php           # Webhook entity
│   ├── Bot.php               # Bot entity
│   ├── BotChannel.php        # Bot channel entity
│   ├── ApiKey.php            # API key entity
│   └── OAuthApplication.php  # OAuth application entity
├── Services/
│   ├── WebhookService.php    # Webhook business logic
│   ├── BotService.php
│   └── ApiService.php
└── Events/
    ├── WebhookTriggered.php
    ├── BotCreated.php
    └── ApiKeyGenerated.php
```

### **10. Security Domain**
```
Domain/Security/
├── Entities/
│   ├── MessageReport.php     # Message report entity
│   └── AuditLog.php          # Audit log entity
├── Services/
│   ├── SecurityService.php   # Security business logic
│   ├── ModerationService.php
│   └── AuditService.php
└── Events/
    ├── MessageReported.php
    ├── UserBanned.php
    └── AuditLogCreated.php
```

## 🔄 **Application Layer (Use Cases)**

### **Services**
```
Application/Services/
├── UserApplicationService.php    # User use cases
├── TeamApplicationService.php    # Team use cases
├── ChannelApplicationService.php # Channel use cases
├── MessageApplicationService.php # Message use cases
├── FileApplicationService.php    # File use cases
├── CallApplicationService.php    # Call use cases
└── NotificationApplicationService.php
```

### **Commands & Queries**
```
Application/Commands/
├── CreateUserCommand.php
├── UpdateUserCommand.php
├── CreateTeamCommand.php
└── SendMessageCommand.php

Application/Queries/
├── GetUserQuery.php
├── GetTeamMembersQuery.php
├── GetChannelMessagesQuery.php
└── SearchMessagesQuery.php
```

### **DTOs**
```
Application/DTOs/
├── UserDTO.php
├── TeamDTO.php
├── ChannelDTO.php
├── MessageDTO.php
└── FileDTO.php
```

## 🏗️ **Infrastructure Layer (External Concerns)**

### **Database**
```
Infrastructure/Database/
├── Repositories/
│   ├── EloquentUserRepository.php
│   ├── EloquentTeamRepository.php
│   ├── EloquentChannelRepository.php
│   └── EloquentMessageRepository.php
├── Migrations/
└── Seeders/
```

### **External Services**
```
Infrastructure/External/
├── EmailService.php
├── SmsService.php
├── PushNotificationService.php
├── FileStorageService.php
└── PaymentService.php
```

### **Events & Queue**
```
Infrastructure/Events/
├── EventDispatcher.php
└── EventListeners/

Infrastructure/Queue/
├── JobDispatcher.php
└── Jobs/
```

## 🔗 **Shared Kernel**

### **Interfaces**
```
Shared/Interfaces/
├── RepositoryInterface.php
├── EventDispatcherInterface.php
├── CacheInterface.php
└── StorageInterface.php
```

### **Events**
```
Shared/Events/
├── DomainEvent.php
├── EventBus.php
└── EventSubscriber.php
```

### **Exceptions**
```
Shared/Exceptions/
├── DomainException.php
├── BusinessRuleException.php
└── ValidationException.php
```

## 🎯 **Lợi ích của DDD**

### **1. Separation of Concerns**
- ✅ **Domain Logic** - Tách biệt business logic
- ✅ **Application Logic** - Tách biệt use cases
- ✅ **Infrastructure** - Tách biệt external concerns

### **2. Maintainability**
- ✅ **Dễ bảo trì** - Code có cấu trúc rõ ràng
- ✅ **Dễ test** - Có thể test từng layer riêng biệt
- ✅ **Dễ debug** - Vấn đề được cô lập trong từng layer

### **3. Scalability**
- ✅ **Dễ mở rộng** - Thêm domain mới dễ dàng
- ✅ **Dễ thay đổi** - Thay đổi implementation không ảnh hưởng domain
- ✅ **Dễ tối ưu** - Tối ưu từng layer riêng biệt

### **4. Team Collaboration**
- ✅ **Phân chia công việc** - Mỗi developer làm việc trên domain riêng
- ✅ **Giảm conflict** - Ít conflict khi merge code
- ✅ **Code review** - Dễ review và approve

## 🚀 **Implementation Guidelines**

### **1. Domain Entities**
```php
namespace App\Domain\User\Entities;

use App\Shared\Events\DomainEvent;

class User
{
    private array $events = [];
    
    public function changeEmail(string $email): void
    {
        $this->email = $email;
        $this->addEvent(new UserEmailChanged($this->id, $email));
    }
    
    private function addEvent(DomainEvent $event): void
    {
        $this->events[] = $event;
    }
    
    public function getEvents(): array
    {
        return $this->events;
    }
}
```

### **2. Application Services**
```php
namespace App\Application\Services;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Events\UserRegistered;

class UserApplicationService
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private EventDispatcherInterface $eventDispatcher
    ) {}
    
    public function registerUser(CreateUserCommand $command): UserDTO
    {
        $user = new User($command->name, $command->email);
        $this->userRepository->save($user);
        
        $this->eventDispatcher->dispatch(new UserRegistered($user->getId()));
        
        return UserDTO::fromEntity($user);
    }
}
```

### **3. Infrastructure Repositories**
```php
namespace App\Infrastructure\Database\Repositories;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\User\Entities\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function save(User $user): void
    {
        $userModel = UserModel::fromEntity($user);
        $userModel->save();
    }
    
    public function findById(string $id): ?User
    {
        $userModel = UserModel::find($id);
        return $userModel ? $userModel->toEntity() : null;
    }
}
```

## 📝 **Kết luận**

**NovaChat Enterprise Edition** với cấu trúc DDD cung cấp:

- ✅ **Kiến trúc rõ ràng** - Dễ hiểu và maintain
- ✅ **Business logic tách biệt** - Domain logic độc lập
- ✅ **Dễ test** - Có thể test từng layer
- ✅ **Dễ mở rộng** - Thêm tính năng mới dễ dàng
- ✅ **Team collaboration** - Nhiều developer có thể làm việc song song
- ✅ **Enterprise ready** - Sẵn sàng cho production

**DDD structure** giúp NovaChat trở thành một **enterprise-grade chat platform** với kiến trúc vững chắc và dễ bảo trì! 🚀
