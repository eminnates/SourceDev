using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Data.Context
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Post> Posts { get; set; }
        public DbSet<PostTranslation> PostTranslations { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<UserFollow> UserFollows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Post>().HasQueryFilter(p => p.deleted_at == null);
            
            // PostTranslation - Composite Primary Key
            modelBuilder.Entity<PostTranslation>()
                .HasKey(pt => new { pt.post_id, pt.language_code });

            // PostTranslation - Slug unique constraint (slug + language_code must be unique)
            modelBuilder.Entity<PostTranslation>()
                .HasIndex(pt => new { pt.slug, pt.language_code })
                .IsUnique();

            // ========== PERFORMANCE INDEXES ==========
            
            // Posts - Indexes for feed queries (ORDER BY created_at DESC, published_at)
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.created_at)
                .HasDatabaseName("IX_Posts_CreatedAt");
            
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.published_at)
                .HasDatabaseName("IX_Posts_PublishedAt");
            
            // Posts - Index for top posts query (ORDER BY view_count DESC)
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.view_count)
                .HasDatabaseName("IX_Posts_ViewCount");
            
            // Posts - Index for user's posts query
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.user_id)
                .HasDatabaseName("IX_Posts_UserId");
            
            // Posts - Composite index for published posts feed (most common query)
            modelBuilder.Entity<Post>()
                .HasIndex(p => new { p.status, p.published_at })
                .HasDatabaseName("IX_Posts_Status_PublishedAt");
            
            // Reactions - Composite index for toggle checks and user reactions lookup
            modelBuilder.Entity<Reaction>()
                .HasIndex(r => new { r.post_id, r.user_id })
                .HasDatabaseName("IX_Reactions_PostId_UserId");
            
            // Comments - Index for post comments and sorting
            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.post_id)
                .HasDatabaseName("IX_Comments_PostId");
            
            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.created_at)
                .HasDatabaseName("IX_Comments_CreatedAt");
            
            // Bookmarks - Index for user's bookmarks query
            modelBuilder.Entity<Bookmark>()
                .HasIndex(b => new { b.user_id, b.created_at })
                .HasDatabaseName("IX_Bookmarks_UserId_CreatedAt");
            
            // Tags - Index for tag name lookup
            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.name)
                .HasDatabaseName("IX_Tags_Name");
            
            // ========== END PERFORMANCE INDEXES ==========

            base.OnModelCreating(modelBuilder);

            // Cascade Delete Ayarları
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // Bookmark - Composite Primary Key
            modelBuilder.Entity<Bookmark>()
                .HasKey(b => new { b.user_id, b.post_id });

            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.Post)
                .WithMany()
                .HasForeignKey(b => b.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // PostTag - Composite Primary Key
            modelBuilder.Entity<PostTag>()
                .HasKey(pt => new { pt.tag_id, pt.post_id });

            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Post)
                .WithMany(p => p.PostTags)
                .HasForeignKey(pt => pt.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.PostTags)
                .HasForeignKey(pt => pt.tag_id)
                .OnDelete(DeleteBehavior.Restrict);

            // UserFollow - Composite Primary Key
            modelBuilder.Entity<UserFollow>()
                .HasKey(uf => new { uf.follower_id, uf.following_id });

            // UserFollow - Follower ilişkisi (Takip eden)
            modelBuilder.Entity<UserFollow>()
                .HasOne<User>()
                .WithMany(u => u.Following)
                .HasForeignKey(uf => uf.follower_id)
                .OnDelete(DeleteBehavior.Restrict);

            // UserFollow - Following ilişkisi (Takip edilen)
            modelBuilder.Entity<UserFollow>()
                .HasOne<User>()
                .WithMany(u => u.Followers)
                .HasForeignKey(uf => uf.following_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Post - User ilişkisi
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // PostTranslation - Slug index removed (unique constraint already set above)
            // PostTranslation - LanguageCode index removed (unique constraint already set above)

            // Comment - User ilişkisi
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Comment - Post ilişkisi
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment - Parent Comment ilişkisi (self-referencing)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.parent_comment_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Reaction - User ilişkisi
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Reaction - Post ilişkisi
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.Post)
                .WithMany(p => p.Reactions)
                .HasForeignKey(r => r.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // User.Id - user_id mapping için
            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .HasColumnName("user_id");

            // Identity tablolarının isimlerini özelleştirme
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
            modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
        }
    }
}
