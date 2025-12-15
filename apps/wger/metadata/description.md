# wger Workout Manager

wger is a free, open-source web application for managing your personal workouts, weight, and diet plans. It features a REST API for third-party integrations and mobile apps.

## Features

- **Workout Management**: Create and track your workout routines with detailed exercise information
- **Exercise Database**: Access thousands of exercises with images, videos, and instructions synced from the wger community
- **Nutrition Tracking**: Log your meals and track nutritional intake with Open Food Facts integration
- **Weight Tracking**: Monitor your body weight and measurements over time
- **REST API**: Full-featured API for mobile apps and third-party integrations
- **Multi-language Support**: Available in multiple languages
- **Guest Mode**: Allow users to try the app without registration

## Getting Started

After installation, access the app through your browser. The first startup may take a few minutes as the app syncs exercises and ingredients from the wger community database.

Default admin credentials can be created via the command line if needed.

## Architecture

This deployment includes:
- **Web Server**: Main Django application
- **PostgreSQL**: Database for storing user data
- **Redis**: Caching layer for improved performance
- **Celery Worker**: Background task processing (exercise sync, image processing)
- **Celery Beat**: Scheduled tasks (periodic sync with wger.de)

## Links

- [GitHub Repository](https://github.com/wger-project/wger)
- [Official Website](https://wger.de)
- [Documentation](https://wger.readthedocs.io)
- [Docker Setup](https://github.com/wger-project/docker)
