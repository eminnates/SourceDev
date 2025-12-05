using SourceDev.API.Repositories;

namespace SourceDev.API.Services.Background
{
    public class ViewCountWorker : BackgroundService
    {
        private readonly IViewCountQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ViewCountWorker> _logger;

        public ViewCountWorker(IViewCountQueue queue, IServiceScopeFactory scopeFactory, ILogger<ViewCountWorker> logger)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("View Count Worker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var postId = await _queue.DequeueAsync(stoppingToken);

                    using var scope = _scopeFactory.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    
                    var post = await unitOfWork.Posts.GetByIdAsync(postId);
                    if (post != null)
                    {
                        post.view_count++;
                        unitOfWork.Posts.Update(post);
                        await unitOfWork.SaveChangesAsync();
                    }
                }
                catch (OperationCanceledException)
                {
                    // Graceful shutdown
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing view count increment");
                }
            }
            
            _logger.LogInformation("View Count Worker stopped.");
        }
    }
}
